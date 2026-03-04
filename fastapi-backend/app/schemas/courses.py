from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class CreateCourseBody(BaseModel):
    name: str
    code: str
    university_id: UUID


class UpdateCourseBody(BaseModel):
    name: str | None = None
    code: str | None = None
    university_id: UUID | None = None


class CourseDataLink(BaseModel):
    course_id: UUID
    department_id: UUID


class Course(BaseModel):
    id: UUID
    name: str
    code: str
    university_id: UUID
    created_at: datetime


class CourseWithDepartment(BaseModel):
    created_at: datetime
    course_id: UUID
    dept_id: UUID
