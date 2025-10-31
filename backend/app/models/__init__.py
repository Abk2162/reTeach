"""
Pydantic Models
API request/response schemas matching the API contract
"""

from app.models.course import CourseLevel
from app.models.form import CreateFormRequest, CreateFormResponse
from app.models.question import (
    Difficulty,
    Question,
    GenerateQuestionsRequest,
    GenerateQuestionsResponse,
)
from app.models.response import (
    StudentResponse,
    TopicStats,
    ResultsResponse,
)
from app.models.topic import Topic, ParseTopicsRequest, ParseTopicsResponse

# Diagnostic system models
from app.models.resource import (
    Resource,
    ResourceType,
    PageContent,
    PageMatch,
    UploadResourceRequest,
    UploadResourceResponse,
)
from app.models.survey import (
    Survey,
    SurveyQuestion,
    SurveyResponse,
    CognitiveLevel,
    TopicScore,
    WeakTopic,
    GapAnalysis,
    GenerateSurveyRequest,
    GenerateSurveyResponse,
)
from app.models.study_plan import (
    StudyPlan,
    StudyPlanStep,
    StudyPlanSummary,
    ReadingAssignment,
    PracticeAssignment,
    VideoAssignment,
    PageRange,
    Priority,
    AssignmentType,
    GenerateStudyPlanRequest,
    GenerateStudyPlanResponse,
)

__all__ = [
    # Original models
    "CourseLevel",
    "Topic",
    "ParseTopicsRequest",
    "ParseTopicsResponse",
    "Difficulty",
    "Question",
    "GenerateQuestionsRequest",
    "GenerateQuestionsResponse",
    "CreateFormRequest",
    "CreateFormResponse",
    "StudentResponse",
    "TopicStats",
    "ResultsResponse",
    # Resource models
    "Resource",
    "ResourceType",
    "PageContent",
    "PageMatch",
    "UploadResourceRequest",
    "UploadResourceResponse",
    # Survey models
    "Survey",
    "SurveyQuestion",
    "SurveyResponse",
    "CognitiveLevel",
    "TopicScore",
    "WeakTopic",
    "GapAnalysis",
    "GenerateSurveyRequest",
    "GenerateSurveyResponse",
    # Study plan models
    "StudyPlan",
    "StudyPlanStep",
    "StudyPlanSummary",
    "ReadingAssignment",
    "PracticeAssignment",
    "VideoAssignment",
    "PageRange",
    "Priority",
    "AssignmentType",
    "GenerateStudyPlanRequest",
    "GenerateStudyPlanResponse",
]
