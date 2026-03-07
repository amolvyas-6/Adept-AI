from datetime import datetime, timezone
from typing import Annotated, Literal
from uuid import UUID

from pydantic import BaseModel, BeforeValidator, Field


class MessageBase(BaseModel):
    content: str
    role: Literal["user", "assistant"]


class MetadataMessage(BaseModel):
    content: list[dict]
    role: Literal["metadata"] = "metadata"


class Chat(BaseModel):
    id: Annotated[str, BeforeValidator(str)] | None = Field(alias="_id", default=None)
    user_id: UUID
    title: str = "New Chat"
    document_ids: list[UUID]
    messages: list[MessageBase | MetadataMessage] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ChatMetadata(BaseModel):
    id: Annotated[str, BeforeValidator(str)] = Field(alias="_id")
    title: str
    document_ids: list[UUID]


class ChatDocuments(BaseModel):
    document_ids: list[UUID]
