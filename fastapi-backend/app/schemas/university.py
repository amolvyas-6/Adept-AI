from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class CreateUniversityBody(BaseModel):
    name: str


class UpdateUniversityBody(BaseModel):
    name: str | None = None


class University(BaseModel):
    id: UUID
    name: str
    created_at: datetime
