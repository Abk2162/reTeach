"""Response and analytics models"""

from typing import List, Optional
from pydantic import BaseModel, Field


class TopicStats(BaseModel):
    """Statistics for a single topic"""
    topic: str = Field(..., description="Topic name")
    n: int = Field(..., ge=0, description="Number of responses")
    correctPct: float = Field(..., ge=0.0, le=100.0, description="Percentage correct")


class StudentResponse(BaseModel):
    """Per-student statistics (optional)"""
    studentId: Optional[str] = Field(None, description="Student identifier")
    studentEmail: str = Field(..., description="Student email")
    score: float = Field(..., ge=0.0, le=100.0, description="Overall score percentage")
    topicScores: List[TopicStats] = Field(
        default_factory=list,
        description="Scores broken down by topic"
    )


class ResultsResponse(BaseModel):
    """GET /api/results/:formId response body"""
    topicStats: List[TopicStats] = Field(..., description="Aggregated topic statistics")
    byStudent: Optional[List[StudentResponse]] = Field(
        None,
        description="Optional per-student breakdown"
    )
