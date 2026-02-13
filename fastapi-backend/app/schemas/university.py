from uuid import UUID

from pydantic import BaseModel


class UniversityCreate(BaseModel):
    name: str


class UniversityUpdate(BaseModel):
    name: str | None = None
