from pydantic import BaseModel
from uuid import UUID


class UniversityCreate(BaseModel):
    name: str


class UniversityUpdate(BaseModel):
    name: str | None = None
