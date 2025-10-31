"""Topic-related models"""

from typing import List, Optional
from pydantic import BaseModel, Field

from app.models.course import CourseLevel


class Topic(BaseModel):
    """
    A topic extracted from a syllabus
    Matches API contract exactly
    """
    id: str = Field(..., description="Unique topic identifier (e.g., 't_001')")
    name: str = Field(..., description="Human-readable topic name")
    weight: float = Field(1.0, ge=0.0, description="Importance weighting")
    prereqs: List[str] = Field(
        default_factory=list,
        description="List of prerequisite topic IDs"
    )


class ParseTopicsRequest(BaseModel):
    """POST /api/parse-topics request body"""
    syllabus_text: str = Field(..., min_length=10, description="Course syllabus text")
    course_level: Optional[CourseLevel] = Field(
        None,
        description="Educational level (hs, ug, grad)"
    )


class ParseTopicsResponse(BaseModel):
    """POST /api/parse-topics response body"""
    topics: List[Topic] = Field(..., description="Extracted topics from syllabus")
