from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime, timezone


class MessageBase(BaseModel):
    content: str
    role: str


class ChatBase(BaseModel):
    user_id: UUID
    title: str = "New Chat"
    document_ids: list[UUID]
    messages: list[MessageBase] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
