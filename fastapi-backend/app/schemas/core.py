from datetime import datetime
from typing import Generic, TypeVar
from uuid import UUID

from pydantic import BaseModel, EmailStr

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    success: bool
    message: str
    data: T | None = None


class BaseUser(BaseModel):
    id: UUID
    email: EmailStr
    created_at: datetime
    updated_at: datetime


class ApiError(BaseModel):
    success: bool = False
    message: str
