"""Resource-related models (textbooks, assignments, etc.)"""

from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum


class ResourceType(str, Enum):
    """Type of learning resource"""
    TEXTBOOK = "textbook"
    ASSIGNMENT = "assignment"
    SLIDES = "slides"
    OTHER = "other"


class Resource(BaseModel):
    """Uploaded learning resource (textbook, assignment, etc.)"""
    id: str = Field(..., description="Unique resource identifier")
    course_id: str = Field(..., description="Associated course ID")
    title: str = Field(..., description="Resource title")
    resource_type: ResourceType = Field(..., description="Type of resource")
    file_path: str = Field(..., description="Path to uploaded file")
    file_name: Optional[str] = Field(None, description="Original filename")
    file_size_mb: Optional[float] = Field(None, description="File size in MB")
    total_pages: Optional[int] = Field(None, description="Number of pages (for PDFs)")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
    indexed: bool = Field(False, description="Whether content has been extracted and indexed")


class PageContent(BaseModel):
    """Extracted content from a single page"""
    page_number: int = Field(..., ge=1, description="Page number (1-indexed)")
    content: str = Field(..., description="Extracted text content")
    word_count: int = Field(..., ge=0, description="Number of words on page")
    has_images: bool = Field(False, description="Whether page contains images")
    has_tables: bool = Field(False, description="Whether page contains tables")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Page-specific metadata")


class PageMatch(BaseModel):
    """Search result for page content"""
    page_number: int = Field(..., description="Page number")
    content: str = Field(..., description="Matched content")
    relevance_score: float = Field(..., ge=0.0, le=1.0, description="Relevance score (0-1)")
    context_snippet: Optional[str] = Field(None, description="Snippet showing match context")


class UploadResourceRequest(BaseModel):
    """Request to upload a new resource"""
    course_id: str = Field(..., description="Course to associate with")
    title: str = Field(..., min_length=1, description="Resource title")
    resource_type: ResourceType = Field(..., description="Type of resource")
    # Note: file_path will be set by the upload handler


class UploadResourceResponse(BaseModel):
    """Response after uploading a resource"""
    resource_id: str = Field(..., description="ID of uploaded resource")
    title: str = Field(..., description="Resource title")
    total_pages: Optional[int] = Field(None, description="Number of pages extracted")
    indexed: bool = Field(..., description="Whether indexing completed successfully")
