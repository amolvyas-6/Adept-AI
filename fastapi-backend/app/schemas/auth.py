from uuid import UUID

from pydantic import BaseModel, EmailStr


class RegisterUser(BaseModel):
    email: EmailStr
    password: str
    fullName: str
    deptId: UUID
    universityId: UUID
