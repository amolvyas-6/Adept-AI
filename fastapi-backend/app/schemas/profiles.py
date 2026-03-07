from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class UserProfile(BaseModel):
    user_id: UUID
    created_at: datetime
    full_name: str
    dept_id: UUID
    university_id: UUID


class UpdateProfileBody(BaseModel):
    full_name: str | None = None
    dept_id: UUID | None = None


class CreateProfileBody(BaseModel):
    fullName: str
    dept_id: UUID
    university_id: UUID
