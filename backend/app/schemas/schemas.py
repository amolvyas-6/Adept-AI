from pydantic import BaseModel, ConfigDict, Field


class PostBase(BaseModel):
    title: str
    content: str
    author: str
