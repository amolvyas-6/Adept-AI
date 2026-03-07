from typing import Annotated
from uuid import UUID

from app.dependencies.ai_dependency import getLLM
from app.dependencies.auth_dependency import get_current_user
from app.dependencies.mongo_client import get_chat_collection
from app.dependencies.supabase_client import get_supabase_client
from app.schemas.chats import Chat, ChatDocuments, ChatMetadata, MessageBase
from app.schemas.core import ApiResponse, BaseUser
from app.services.chats import (
    add_document_to_chat,
    add_message_to_chat,
    create_new_chat,
    delete_chat_by_id,
    delete_documents_from_chat,
    get_chat_by_id,
    get_user_chats,
)
from app.utils.agent import LLM
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pymongo.collection import Collection
from supabase import Client

router = APIRouter(
    prefix="/chats",
    tags=["chats"],
)


@router.get("")
def get_all_user_chats(
    logged_in_user: Annotated[BaseUser, Depends(get_current_user)],
    chat_collection: Annotated[Collection, Depends(get_chat_collection)],
) -> ApiResponse[list[ChatMetadata]]:
    chats = get_user_chats(chat_collection, logged_in_user)
    return ApiResponse(
        success=True, data=chats, message="User chats fetched successfully"
    )


@router.get("/{chat_id}")
def get_chat(
    chat_id: str,
    logged_in_user: Annotated[BaseUser, Depends(get_current_user)],
    chat_collection: Annotated[Collection, Depends(get_chat_collection)],
) -> ApiResponse[Chat]:
    chat = get_chat_by_id(chat_id, logged_in_user, chat_collection)
    return ApiResponse(success=True, data=chat, message="Chat fetched successfully")


@router.post("")
def create_chat(
    document_id: UUID,
    current_user: Annotated[BaseUser, Depends(get_current_user)],
    chat_collection: Annotated[Collection, Depends(get_chat_collection)],
    db: Annotated[Client, Depends(get_supabase_client)],
) -> ApiResponse[Chat]:
    chat = create_new_chat(document_id, current_user, chat_collection, db)
    return ApiResponse(success=True, data=chat, message="Chat created successfully")


@router.post("/{chat_id}/messages/stream")
def add_message(
    message: MessageBase,
    chat_id: str,
    llm: Annotated[LLM, Depends(getLLM)],
    current_user: Annotated[BaseUser, Depends(get_current_user)],
    chat_collection: Annotated[Collection, Depends(get_chat_collection)],
):
    return StreamingResponse(
        content=add_message_to_chat(
            chat_id, message, llm, current_user, chat_collection
        ),
        media_type="text/event-stream",
    )


@router.post("/{chat_id}/documents/{document_id}")
def update_chat_documents(
    chat_id: str,
    document_id: UUID,
    current_user: Annotated[BaseUser, Depends(get_current_user)],
    chat_collection: Annotated[Collection, Depends(get_chat_collection)],
    db: Annotated[Client, Depends(get_supabase_client)],
) -> ApiResponse[ChatDocuments]:
    result = add_document_to_chat(
        chat_id, document_id, current_user, chat_collection, db
    )
    return ApiResponse(
        success=True, data=result, message="Document added to chat successfully"
    )


@router.delete("/{chat_id}/documents/{document_id}")
def remove_document_from_chat(
    chat_id: str,
    document_id: UUID,
    current_user: Annotated[BaseUser, Depends(get_current_user)],
    chat_collection: Annotated[Collection, Depends(get_chat_collection)],
) -> ApiResponse[ChatDocuments]:
    result = delete_documents_from_chat(
        chat_id, document_id, current_user, chat_collection
    )
    return ApiResponse(
        success=True, data=result, message="Document removed from chat successfully"
    )


@router.delete("/{chat_id}")
def delete_chat(
    chat_id: str,
    logged_in_user: Annotated[BaseUser, Depends(get_current_user)],
    chat_collection: Annotated[Collection, Depends(get_chat_collection)],
) -> ApiResponse[None]:
    result = delete_chat_by_id(chat_id, logged_in_user, chat_collection)
    return ApiResponse(success=True, data=result, message="Chat deleted successfully")
