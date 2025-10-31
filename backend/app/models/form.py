"""Form-related models"""

from typing import List
from pydantic import BaseModel, Field, HttpUrl

from app.models.question import Question


class CreateFormRequest(BaseModel):
    """POST /api/create-form request body"""
    title: str = Field(..., min_length=1, description="Form title")
    questions: List[Question] = Field(..., min_length=1, description="Questions to include")


class CreateFormResponse(BaseModel):
    """POST /api/create-form response body"""
    formUrl: str = Field(..., description="URL to the created form")
    formId: str = Field(..., description="Unique form identifier")
    slug: str = Field(..., description="Form slug for student access")
