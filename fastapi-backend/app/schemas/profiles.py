from pydantic import BaseModel
from uuid import UUID


class ProfileUpdate(BaseModel):
    fullName: str | None
    deptId: UUID | None
