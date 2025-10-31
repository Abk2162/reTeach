"""Question-related models"""

from enum import Enum
from typing import List, Optional, Union
from pydantic import BaseModel, Field, field_validator, model_validator


class Difficulty(str, Enum):
    """Question difficulty level"""
    EASY = "easy"
    MEDIUM = "med"
    HARD = "hard"


class Topic(BaseModel):
    """Topic input model"""
    id: str = Field(..., description="Topic ID")
    name: str = Field(..., description="Topic name")


class Question(BaseModel):
    """
    Multiple-choice question
    Matches API contract exactly
    """
    id: str = Field(..., max_length=100, description="Unique question identifier (e.g., 'q_001')")
    topic: str = Field(..., max_length=255, description="Topic this question tests")
    stem: str = Field(..., min_length=5, max_length=2000, description="Question text")
    options: List[str] = Field(..., min_length=2, max_length=6, description="Answer choices")
    answerIndex: int = Field(..., ge=0, le=5, description="0-based index of correct answer (max 5 for 6 options)")
    rationale: str = Field(..., max_length=2000, description="Explanation of correct answer")
    difficulty: Difficulty = Field(..., description="Question difficulty level")
    bloom: str = Field(..., max_length=50, description="Bloom's taxonomy level")

    @field_validator("options")
    @classmethod
    def validate_option_lengths(cls, v: List[str]) -> List[str]:
        """Ensure each option is within reasonable length"""
        for option in v:
            if len(option) > 500:
                raise ValueError("Each option must be 500 characters or less")
        return v

    @model_validator(mode='after')
    def validate_answer_index_bounds(self) -> 'Question':
        """Ensure answerIndex is within bounds of options array"""
        if self.answerIndex >= len(self.options):
            raise ValueError(
                f"answerIndex {self.answerIndex} out of bounds for {len(self.options)} options"
            )
        return self


class GenerateQuestionsRequest(BaseModel):
    """POST /api/generate-questions request body"""
    topics: List[Union[str, Topic]] = Field(..., min_length=1, description="List of topic IDs or topic objects")
    count_per_topic: int = Field(default=5, ge=1, le=20, description="Questions per topic")
    difficulty: Optional[str] = Field(default="medium", description="Target difficulty")
    course_id: Optional[str] = Field(None, description="Course ID")
    course_name: Optional[str] = Field(None, description="Course name")
    course_level: Optional[str] = Field(None, description="Course level")
    textbook_id: Optional[str] = Field(None, description="Textbook ID to generate questions from")
    use_textbook: bool = Field(False, description="Whether to use textbook content for generation")
    total_count: Optional[int] = Field(None, description="Total number of questions desired")
    bloom_levels: Optional[List[str]] = Field(None, description="Bloom's taxonomy levels to target")


class GenerateQuestionsResponse(BaseModel):
    """POST /api/generate-questions response body"""
    questions: List[Question] = Field(..., description="Generated MCQ questions")
