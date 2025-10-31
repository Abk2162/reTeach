"""
Topic Parsing Router
Endpoints for extracting topics from syllabi
"""

import logging
import traceback
from fastapi import APIRouter, HTTPException
from typing import List

from app.models.topic import Topic, ParseTopicsRequest, ParseTopicsResponse
from app.models.course import CourseLevel
from app.services.topic_parser import get_topic_parser

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/topics", tags=["topics"])


@router.post("/parse", response_model=ParseTopicsResponse)
async def parse_topics(request: ParseTopicsRequest):
    """
    Parse topics from course syllabus text using AI

    Args:
        request: ParseTopicsRequest with syllabus_text and optional course_level

    Returns:
        ParseTopicsResponse with extracted topics
    """
    try:
        logger.info(f"[TOPICS API] Received parse request - syllabus length: {len(request.syllabus_text)}")
        
        parser = get_topic_parser()
        logger.info("[TOPICS API] Topic parser initialized")

        topics, prerequisites = await parser.parse_topics(
            syllabus_text=request.syllabus_text,
            course_level=request.course_level or CourseLevel.UNDERGRADUATE
        )
        
        logger.info(f"[TOPICS API] Successfully parsed {len(topics)} topics")

        return ParseTopicsResponse(topics=topics)

    except Exception as e:
        logger.error(f"[TOPICS API ERROR] {type(e).__name__}: {str(e)}")
        logger.error(f"[TOPICS API ERROR] Full traceback:\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse topics: {str(e)}"
        )
