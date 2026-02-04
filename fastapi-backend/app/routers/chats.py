from fastapi import APIRouter, Depends
from app.dependencies.authDependency import get_current_user
from app.dependencies.mongoClient import get_chat_collection
from app.dependencies.supabaseClient import get_supabase_client
from app.services.chats import (
    addDocumentToChat,
    addMessageToChat,
    createNewChat,
    deleteChatById,
    getChatById,
    getUserChats,
    delelteDocumentFromChat,
)
from app.schemas.chats import MessageBase
from uuid import UUID


router = APIRouter(
    prefix="/chats",
    tags=["chats"],
)


@router.get("/")
def getAllUserChats(
    loggedInUser=Depends(get_current_user), chatCollection=Depends(get_chat_collection)
):
    chats = getUserChats(chatCollection, loggedInUser)
    return {
        "success": True,
        "data": chats,
        "message": "User chats fetched successfully",
    }


@router.get("/{chatId}")
def getChat(
    chatId: str,
    loggedInUser=Depends(get_current_user),
    chatCollection=Depends(get_chat_collection),
):
    chat = getChatById(chatId, loggedInUser, chatCollection)
    return {
        "success": True,
        "data": chat,
        "message": "Chat fetched successfully",
    }


@router.post("/")
def createChat(
    documentId: UUID,
    currentUser=Depends(get_current_user),
    chatCollection=Depends(get_chat_collection),
    db=Depends(get_supabase_client),
):
    chat = createNewChat(documentId, currentUser, chatCollection, db)
    return {
        "success": True,
        "data": chat,
        "message": "Chat created successfully",
    }


@router.post("/{chatId}/messages")
def addMessage(
    message: MessageBase,
    chatId: str,
    loggedInUser=Depends(get_current_user),
    chatCollection=Depends(get_chat_collection),
):
    addedMessage = addMessageToChat(chatId, message, loggedInUser, chatCollection)
    return {
        "success": True,
        "data": addedMessage,
        "message": "Message added to chat successfully",
    }


@router.post("/{chatId}/documents/{documentId}")
def updateChatDocuments(
    chatId: str,
    documentId: UUID,
    loggedInUser=Depends(get_current_user),
    chatCollection=Depends(get_chat_collection),
    db=Depends(get_supabase_client),
):
    result = addDocumentToChat(chatId, documentId, loggedInUser, chatCollection, db)
    return {
        "success": True,
        "data": result,
        "message": "Document added to chat successfully",
    }


@router.delete("/{chatId}/documents/{documentId}")
def removeDocumentFromChat(
    chatId: str,
    documentId: UUID,
    loggedInUser=Depends(get_current_user),
    chatCollection=Depends(get_chat_collection),
):
    result = delelteDocumentFromChat(chatId, documentId, loggedInUser, chatCollection)
    return {
        "success": True,
        "data": result,
        "message": "Document removed from chat successfully",
    }


@router.delete("/{chatId}")
def deleteChat(
    chatId: str,
    loggedInUser=Depends(get_current_user),
    chatCollection=Depends(get_chat_collection),
):
    result = deleteChatById(chatId, loggedInUser, chatCollection)
    return {
        "success": True,
        "data": result,
        "message": "Chat deleted successfully",
    }
