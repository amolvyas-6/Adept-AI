from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class DocumentBase(BaseModel):
    id: UUID
    title: str
    user_id: UUID
    course_id: UUID
    unit: int
    created_at: datetime


class Document(DocumentBase):
    uploaded_by: str | None = None
    course_code: str | None = None
    course_name: str | None = None


class DocumentWithURL(Document):
    url: str


class CreateDocumentBody(BaseModel):
    title: str | None = None
    course_id: UUID
    unit: int = Field(..., ge=0, le=5)
