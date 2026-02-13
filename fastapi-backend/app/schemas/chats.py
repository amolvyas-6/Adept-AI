from datetime import datetime, timezone
from uuid import UUID

from pydantic import BaseModel, Field


class MessageBase(BaseModel):
    content: str | list[dict]
    role: str


class ChatBase(BaseModel):
    user_id: UUID
    title: str = "New Chat"
    document_ids: list[UUID]
    messages: list[MessageBase] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
