from typing import Annotated
from uuid import UUID

from app.dependencies.aiDependency import getLLM
from app.dependencies.authDependency import get_current_user
from app.dependencies.mongoClient import get_chat_collection
from app.dependencies.supabaseClient import get_supabase_client
from app.schemas.chats import Chat, ChatDocuments, ChatMetadata, MessageBase
from app.schemas.core import ApiResponse, BaseUser
from app.services.chats import (
    addDocumentToChat,
    addMessageToChat,
    createNewChat,
    delelteDocumentFromChat,
    deleteChatById,
    getChatById,
    getUserChats,
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


@router.get("/")
def getAllUserChats(
    loggedInUser: Annotated[BaseUser, Depends(get_current_user)],
    chatCollection: Annotated[Collection, Depends(get_chat_collection)],
) -> ApiResponse[list[ChatMetadata]]:
    chats = getUserChats(chatCollection, loggedInUser)
    return ApiResponse(
        success=True, data=chats, message="User chats fetched successfully"
    )


@router.get("/{chatId}")
def getChat(
    chatId: str,
    loggedInUser: Annotated[BaseUser, Depends(get_current_user)],
    chatCollection: Annotated[Collection, Depends(get_chat_collection)],
) -> ApiResponse[Chat]:
    chat = getChatById(chatId, loggedInUser, chatCollection)
    return ApiResponse(success=True, data=chat, message="Chat fetched successfully")


@router.post("/")
def createChat(
    documentId: UUID,
    currentUser: Annotated[BaseUser, Depends(get_current_user)],
    chatCollection: Annotated[Collection, Depends(get_chat_collection)],
    db: Annotated[Client, Depends(get_supabase_client)],
) -> ApiResponse[Chat]:
    chat = createNewChat(documentId, currentUser, chatCollection, db)
    return ApiResponse(success=True, data=chat, message="Chat created successfully")


@router.post("/{chatId}/messages/stream")
def addMessage(
    message: MessageBase,
    chatId: str,
    llm: Annotated[LLM, Depends(getLLM)],
    loggedInUser: Annotated[BaseUser, Depends(get_current_user)],
    chatCollection: Annotated[Collection, Depends(get_chat_collection)],
):
    return StreamingResponse(
        content=addMessageToChat(chatId, message, llm, loggedInUser, chatCollection),
        media_type="text/event-stream",
    )


@router.post("/{chatId}/documents/{documentId}")
def updateChatDocuments(
    chatId: str,
    documentId: UUID,
    loggedInUser: Annotated[BaseUser, Depends(get_current_user)],
    chatCollection: Annotated[Collection, Depends(get_chat_collection)],
    db: Annotated[Client, Depends(get_supabase_client)],
) -> ApiResponse[ChatDocuments]:
    result = addDocumentToChat(chatId, documentId, loggedInUser, chatCollection, db)
    return ApiResponse(
        success=True, data=result, message="Document added to chat successfully"
    )


@router.delete("/{chatId}/documents/{documentId}")
def removeDocumentFromChat(
    chatId: str,
    documentId: UUID,
    loggedInUser: Annotated[BaseUser, Depends(get_current_user)],
    chatCollection: Annotated[Collection, Depends(get_chat_collection)],
) -> ApiResponse[ChatDocuments]:
    result = delelteDocumentFromChat(chatId, documentId, loggedInUser, chatCollection)
    return ApiResponse(
        success=True, data=result, message="Document removed from chat successfully"
    )


@router.delete("/{chatId}")
def deleteChat(
    chatId: str,
    loggedInUser: Annotated[BaseUser, Depends(get_current_user)],
    chatCollection: Annotated[Collection, Depends(get_chat_collection)],
) -> ApiResponse[None]:
    result = deleteChatById(chatId, loggedInUser, chatCollection)
    return ApiResponse(success=True, data=result, message="Chat deleted successfully")
