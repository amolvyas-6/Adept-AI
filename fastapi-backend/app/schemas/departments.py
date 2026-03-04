from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class CreateDepartmentBody(BaseModel):
    name: str
    abbreviation: str
    university_id: UUID


class UpdateDepartmentBody(BaseModel):
    name: str | None = None
    abbreviation: str | None = None
    university_id: UUID | None = None


class Department(BaseModel):
    id: UUID
    name: str
    abbreviation: str
    created_at: datetime
    university_id: UUID
