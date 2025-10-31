"""Study plan models"""

from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field
from enum import Enum


class Priority(str, Enum):
    """Priority level for study items"""
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class AssignmentType(str, Enum):
    """Type of study assignment"""
    READING = "reading"
    PRACTICE = "practice"
    VIDEO = "video"
    OTHER = "other"


class PageRange(BaseModel):
    """Range of pages in a textbook"""
    start: int = Field(..., ge=1, description="Starting page number")
    end: int = Field(..., ge=1, description="Ending page number")

    @property
    def page_count(self) -> int:
        """Calculate number of pages"""
        return self.end - self.start + 1

    def __str__(self) -> str:
        return f"{self.start}-{self.end}"


class ReadingAssignment(BaseModel):
    """Reading assignment from a textbook"""
    assignment_type: AssignmentType = Field(default=AssignmentType.READING)
    topic: str = Field(..., description="Topic this reading covers")
    source: str = Field(..., description="Source (e.g., 'Stewart Calculus 8th ed')")
    resource_id: Optional[str] = Field(None, description="Resource ID if from uploaded file")
    pages: Optional[PageRange] = Field(None, description="Page range to read")
    page_count: Optional[int] = Field(None, description="Number of pages")
    section_reference: Optional[str] = Field(None, description="Section (e.g., 'Section 3.2')")
    estimated_minutes: int = Field(..., ge=0, description="Estimated time to complete")
    key_concepts: List[str] = Field(default_factory=list, description="Key concepts covered")
    why_relevant: str = Field(..., description="Why this is assigned")


class PracticeAssignment(BaseModel):
    """Practice problems assignment"""
    assignment_type: AssignmentType = Field(default=AssignmentType.PRACTICE)
    topic: str = Field(..., description="Topic for practice")
    source: str = Field(..., description="Source of problems")
    resource_id: Optional[str] = Field(None, description="Resource ID if from uploaded file")
    section_reference: Optional[str] = Field(None, description="Section reference")
    problems: str = Field(..., description="Problem numbers (e.g., '#1-10, #15-20')")
    estimated_minutes: int = Field(..., ge=0, description="Estimated time")
    why_relevant: str = Field(..., description="Why these problems matter")


class VideoAssignment(BaseModel):
    """Video learning assignment"""
    assignment_type: AssignmentType = Field(default=AssignmentType.VIDEO)
    topic: str = Field(..., description="Topic covered")
    title: str = Field(..., description="Video title")
    url: Optional[str] = Field(None, description="Video URL")
    duration_minutes: int = Field(..., ge=0, description="Video length")
    key_concepts: List[str] = Field(default_factory=list, description="Concepts covered")
    why_relevant: str = Field(..., description="Why watch this")


Assignment = Union[ReadingAssignment, PracticeAssignment, VideoAssignment]


class StudyPlanStep(BaseModel):
    """Single step in a study plan"""
    step_number: int = Field(..., ge=1, description="Step order")
    topic: str = Field(..., description="Topic name")
    topic_id: str = Field(..., description="Topic ID")
    priority: Priority = Field(..., description="Priority level")
    resources: List[Dict[str, Any]] = Field(..., description="Assignments for this step")
    goals: List[str] = Field(..., description="Learning goals for this topic")
    estimated_minutes: int = Field(..., ge=0, description="Total time for this step")


class StudyPlanSummary(BaseModel):
    """Summary statistics for a study plan"""
    topics_tested: int = Field(..., ge=0, description="Total topics assessed")
    topics_strong: int = Field(..., ge=0, description="Topics with score ≥60%")
    topics_weak: int = Field(..., ge=0, description="Topics with score <60%")
    overall_readiness: float = Field(..., ge=0.0, le=100.0, description="Overall readiness %")
    estimated_study_time: int = Field(..., ge=0, description="Total study time (minutes)")


class StudyPlan(BaseModel):
    """Complete personalized study plan"""
    id: str = Field(..., description="Unique study plan ID")
    course_id: str = Field(..., description="Associated course ID")
    student_id: Optional[str] = Field(None, description="Student ID (optional)")
    survey_id: str = Field(..., description="Diagnostic survey ID")
    title: str = Field(..., description="Study plan title")
    summary: StudyPlanSummary = Field(..., description="Plan summary")
    weak_topics: List[Dict[str, Any]] = Field(..., description="Weak topics from survey")
    study_plan: List[StudyPlanStep] = Field(..., description="Ordered study steps")
    verification_quiz_id: Optional[str] = Field(None, description="Verification quiz ID")
    status: str = Field(default="active", description="Plan status")
    created_at: Optional[str] = Field(None, description="Creation timestamp")


class GenerateStudyPlanRequest(BaseModel):
    """Request to generate a study plan"""
    survey_id: str = Field(..., description="Survey ID with responses")
    student_id: Optional[str] = Field(None, description="Student ID (optional)")
    resource_ids: List[str] = Field(default_factory=list, description="Available resource IDs")
    min_score_threshold: float = Field(60.0, ge=0.0, le=100.0, description="Min score for 'strong'")


class GenerateStudyPlanResponse(BaseModel):
    """Response after generating a study plan"""
    study_plan: StudyPlan = Field(..., description="Generated study plan")
    verification_quiz_ready: bool = Field(..., description="Whether quiz was generated")
