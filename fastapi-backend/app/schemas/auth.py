from pydantic import BaseModel, EmailStr
from uuid import UUID


class RegisterUser(BaseModel):
    email: EmailStr
    password: str
    fullName: str
    deptId: UUID
    universityId: UUID
