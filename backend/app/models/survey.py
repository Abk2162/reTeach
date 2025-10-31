"""Diagnostic survey models"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum


class CognitiveLevel(str, Enum):
    """Bloom's taxonomy cognitive levels"""
    REMEMBER = "remember"
    UNDERSTAND = "understand"
    APPLY = "apply"
    ANALYZE = "analyze"
    EVALUATE = "evaluate"
    CREATE = "create"


class SurveyQuestion(BaseModel):
    """Yes/No diagnostic question"""
    id: str = Field(..., description="Unique question identifier (e.g., 'sq_001')")
    topic_id: str = Field(..., description="Topic this question assesses")
    text: str = Field(..., min_length=5, description="Question text")
    cognitive_level: CognitiveLevel = Field(..., description="Bloom's taxonomy level")


class Survey(BaseModel):
    """Diagnostic survey with Yes/No questions"""
    id: str = Field(..., description="Unique survey identifier")
    course_id: str = Field(..., description="Associated course ID")
    title: str = Field(..., description="Survey title")
    description: Optional[str] = Field(None, description="Survey description")
    questions: List[SurveyQuestion] = Field(..., min_length=1, description="Survey questions")
    total_questions: int = Field(..., description="Total number of questions")


class SurveyResponse(BaseModel):
    """Student's answer to a survey question"""
    survey_id: str = Field(..., description="Survey ID")
    student_id: Optional[str] = Field(None, description="Student ID (optional)")
    student_email: Optional[str] = Field(None, description="Student email (optional)")
    topic_id: str = Field(..., description="Topic ID")
    question_id: str = Field(..., description="Question ID")
    question_text: str = Field(..., description="The question text")
    answer: bool = Field(..., description="Yes (true) or No (false)")


class TopicScore(BaseModel):
    """Score for a single topic"""
    topic_id: str = Field(..., description="Topic ID")
    topic_name: str = Field(..., description="Topic name")
    total_questions: int = Field(..., ge=0, description="Number of questions for this topic")
    correct_answers: int = Field(..., ge=0, description="Number of 'Yes' answers")
    score_percentage: float = Field(..., ge=0.0, le=100.0, description="Percentage score")
    proficiency_level: str = Field(..., description="'strong' or 'weak'")


class WeakTopic(BaseModel):
    """Topic identified as weak (needs study)"""
    topic_id: str = Field(..., description="Topic ID")
    topic_name: str = Field(..., description="Topic name")
    score_percentage: float = Field(..., ge=0.0, le=100.0, description="Score (0-100)")
    gap_size: float = Field(..., description="How far below threshold (60 - score)")
    priority: str = Field(..., description="HIGH, MEDIUM, or LOW")
    weight: float = Field(1.0, description="Topic importance weight")


class GapAnalysis(BaseModel):
    """Complete knowledge gap analysis"""
    survey_id: str = Field(..., description="Survey ID")
    student_id: Optional[str] = Field(None, description="Student ID")
    total_topics: int = Field(..., ge=0, description="Total topics tested")
    strong_topics: List[TopicScore] = Field(default_factory=list, description="Topics ≥60%")
    weak_topics: List[WeakTopic] = Field(default_factory=list, description="Topics <60%")
    overall_readiness: float = Field(..., ge=0.0, le=100.0, description="Overall score %")
    needs_study: bool = Field(..., description="Whether student needs to study")


class GenerateSurveyRequest(BaseModel):
    """Request to generate a diagnostic survey"""
    topics: List[str] = Field(..., min_length=1, description="Topic IDs to survey")
    questions_per_topic: int = Field(5, ge=3, le=10, description="Questions per topic")


class GenerateSurveyResponse(BaseModel):
    """Response after generating a survey"""
    survey: Survey = Field(..., description="Generated survey")
