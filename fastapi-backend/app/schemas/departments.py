from pydantic import BaseModel
from uuid import UUID


class DepartmentCreate(BaseModel):
    name: str
    abbreviation: str
    university_id: UUID


class DepartmentUpdate(BaseModel):
    name: str | None = None
    abbreviation: str | None = None
    university_id: UUID | None = None
