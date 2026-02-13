from uuid import UUID

from pydantic import BaseModel


class ProfileUpdate(BaseModel):
    fullName: str | None
    deptId: UUID | None
