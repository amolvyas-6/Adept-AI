from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class LibraryItem(BaseModel):
    user_id: UUID
    document_id: UUID
    created_at: datetime


class Library(BaseModel):
    saved_at: datetime
    document_id: UUID
    title: str
    unit: int
    uploader: str | None
    course_code: str
    course_name: str
