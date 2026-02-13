from uuid import UUID

from pydantic import BaseModel


class CourseCreate(BaseModel):
    name: str
    code: str
    university_id: UUID


class CourseUpdate(BaseModel):
    name: str | None = None
    code: str | None = None
    university_id: UUID | None = None


class CourseDataLink(BaseModel):
    course_id: UUID
    department_id: UUID
