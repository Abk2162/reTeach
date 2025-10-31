"""Textbook upload and parsing endpoints"""

import os
from typing import List
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pydantic import BaseModel, Field

from app.services.textbook_parser import TextbookParser
from app.services.topic_parser import get_topic_parser
from app.models.topic import Topic, CourseLevel
from app.config import get_settings
from app.database import db

router = APIRouter(prefix="/api/textbooks", tags=["textbooks"])
settings = get_settings()


class UploadTextbookResponse(BaseModel):
    """Response after uploading a textbook"""
    textbook_id: str = Field(..., description="Unique textbook identifier")
    title: str = Field(..., description="Textbook title")
    total_pages: int = Field(..., description="Number of pages")
    file_path: str = Field(..., description="Storage path")
    topics: List[Topic] = Field(..., description="Auto-extracted topics")


class TextbookTopicsResponse(BaseModel):
    """Topics extracted from textbook"""
    textbook_id: str = Field(..., description="Textbook ID")
    topics: List[Topic] = Field(..., description="Extracted topics")


@router.post("/upload", response_model=UploadTextbookResponse)
async def upload_textbook(
    file: UploadFile = File(..., description="PDF file to upload"),
    course_level: str = "ug"
):
    """
    Upload a textbook PDF and automatically extract topics

    Steps:
    1. Validate PDF file
    2. Save to storage
    3. Parse textbook structure (chapters, sections)
    4. Extract topics using Claude AI
    5. Return textbook metadata and topics
    """

    # Validate file type
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")

    # Validate file size (50MB max)
    file_content = await file.read()
    file_size_mb = len(file_content) / (1024 * 1024)

    if file_size_mb > 50:
        raise HTTPException(status_code=400, detail="File size must be less than 50MB")

    # Generate unique textbook ID
    import uuid
    textbook_id = str(uuid.uuid4())

    # Save file to storage
    upload_dir = settings.upload_dir or "/tmp/uploads"
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, f"{textbook_id}.pdf")

    with open(file_path, "wb") as f:
        f.write(file_content)

    # Parse textbook structure
    parser = TextbookParser()
    try:
        structure = await parser.parse_textbook(file_path)
    except Exception as e:
        # Clean up file on parsing error
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Failed to parse PDF: {str(e)}")

    # Extract topics using Claude AI
    topic_parser = get_topic_parser()

    # Build syllabus-like text from textbook structure
    syllabus_text = _build_syllabus_from_structure(structure)

    try:
        topics, _ = await topic_parser.parse_topics(
            syllabus_text=syllabus_text,
            course_level=CourseLevel(course_level) if course_level else CourseLevel.UNDERGRADUATE
        )
    except Exception as e:
        # Clean up file on topic extraction error
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Failed to extract topics: {str(e)}")

    # Get title from filename (remove .pdf extension)
    title = file.filename.replace('.pdf', '').replace('_', ' ').title()

    # Store textbook in database
    # First, we need a course_id - for now, use a default or create one
    # In a real app, this would come from the authenticated user's course
    try:
        # Create or get default course
        course_result = db.client.table("courses").select("id").limit(1).execute()

        if course_result.data:
            course_id = course_result.data[0]['id']
        else:
            # Create default course
            new_course = db.client.table("courses").insert({
                "title": "Default Course",
                "course_level": "ug"
            }).execute()
            course_id = new_course.data[0]['id']

        # Insert textbook resource
        resource_data = {
            "id": textbook_id,
            "course_id": course_id,
            "title": title,
            "resource_type": "textbook",
            "file_path": file_path,
            "file_name": file.filename,
            "file_size_mb": file_size_mb,
            "total_pages": structure.get('total_pages', 0),
            "metadata": {
                "chapters": structure.get('chapters', []),
                "title": structure.get('title', title)
            },
            "indexed": True
        }

        db.client.table("resources").insert(resource_data).execute()

        # Store topics in database
        for topic in topics:
            topic_data = {
                "course_id": course_id,
                "topic_id": topic.id,
                "name": topic.name,
                "weight": topic.weight,
                "order_index": topics.index(topic)
            }
            db.client.table("topics").insert(topic_data).execute()

    except Exception as e:
        # Clean up file on database error
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Failed to store in database: {str(e)}")

    return UploadTextbookResponse(
        textbook_id=textbook_id,
        title=title,
        total_pages=structure.get('total_pages', 0),
        file_path=file_path,
        topics=topics
    )


@router.get("/{textbook_id}/topics", response_model=TextbookTopicsResponse)
async def get_textbook_topics(textbook_id: str):
    """
    Get topics for a previously uploaded textbook

    This endpoint retrieves cached topics from the database.
    """

    try:
        # Get resource from database
        resource_result = db.client.table("resources").select("*").eq("id", textbook_id).execute()

        if not resource_result.data:
            raise HTTPException(status_code=404, detail="Textbook not found")

        resource = resource_result.data[0]
        course_id = resource['course_id']

        # Get topics for this textbook's course
        topics_result = db.client.table("topics")\
            .select("*")\
            .eq("course_id", course_id)\
            .order("order_index")\
            .execute()

        # Transform to Topic models
        topics = []
        for t in topics_result.data:
            topics.append(Topic(
                id=t['topic_id'],
                name=t['name'],
                weight=t.get('weight', 1.0),
                prereqs=[]  # TODO: Fetch from topic_prerequisites table if needed
            ))

        return TextbookTopicsResponse(
            textbook_id=textbook_id,
            topics=topics
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch topics: {str(e)}")


def _build_syllabus_from_structure(structure: dict) -> str:
    """
    Convert textbook structure into syllabus-like text for topic extraction

    Args:
        structure: Parsed textbook structure from TextbookParser

    Returns:
        Formatted text that looks like a syllabus
    """
    lines = []

    # Add title
    if 'title' in structure:
        lines.append(f"Course: {structure['title']}")
        lines.append("")

    # Add chapters and sections
    chapters = structure.get('chapters', [])

    for chapter in chapters:
        chapter_num = chapter.get('number', '')
        chapter_title = chapter.get('title', '')
        page_start = chapter.get('page_start', '')
        page_end = chapter.get('page_end', '')

        # Format: "Chapter 3: Derivatives (pp. 79-142)"
        chapter_line = f"Chapter {chapter_num}: {chapter_title}"
        if page_start and page_end:
            chapter_line += f" (pp. {page_start}-{page_end})"

        lines.append(chapter_line)

        # Add sections under this chapter
        sections = chapter.get('sections', [])
        for section in sections:
            section_num = section.get('number', '')
            section_title = section.get('title', '')

            if section_num and section_title:
                lines.append(f"  {section_num} {section_title}")

        lines.append("")  # Blank line between chapters

    return "\n".join(lines)
