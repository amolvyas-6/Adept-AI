import json
from uuid import UUID

from app.schemas.chats import ChatBase, MessageBase
from app.utils.agent import LLM
from bson import ObjectId
from fastapi import HTTPException
from pymongo.collection import Collection
from supabase import Client


def getUserChats(chatCollection: Collection, loggedInUser):
    userId = UUID(loggedInUser.id)
    query, filetrs = {"user_id": userId}, {"_id": 1, "title": 1, "document_ids": 1}
    chatsCursor = chatCollection.find(query, filetrs)
    chats = []
    for chat in chatsCursor:
        chat["_id"] = str(chat["_id"])
        chats.append(chat)
    return chats


def getChatById(chatId: str, loggedInUser, chatCollection: Collection):
    userId = UUID(loggedInUser.id)
    query = {"_id": ObjectId(chatId)}
    chat = chatCollection.find_one(query)
    if chat:
        if chat["user_id"] != userId:
            raise HTTPException(status_code=403, detail="Access denied to this chat")
        chat["_id"] = str(chat["_id"])
    else:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat


def createNewChat(
    documentId: UUID, currentUser, chatCollection: Collection, db: Client
):
    userId = UUID(currentUser.id)

    response = db.table("documents").select("id").eq("id", str(documentId)).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Document not found")

    newChat = ChatBase(user_id=userId, document_ids=[documentId], messages=[])
    chatDict = newChat.model_dump()
    result = chatCollection.insert_one(chatDict)
    if not result.acknowledged:
        raise HTTPException(status_code=500, detail="Failed to create chat")
    chatDict["_id"] = str(result.inserted_id)

    return chatDict


def updateChat(chatId, message: MessageBase, chatCollection: Collection):
    query = {"_id": ObjectId(chatId)}
    update = {"$push": {"messages": message.model_dump()}}
    result = chatCollection.update_one(query, update)
    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to update chat")


def addMessageToChat(
    chatId: str,
    userMessage: MessageBase,
    llm: LLM,
    loggedInUser,
    chatCollection: Collection,
):
    userId = UUID(loggedInUser.id)
    query = {"_id": ObjectId(chatId)}
    chat = chatCollection.find_one(query)
    if chat:
        if chat["user_id"] != userId:
            raise HTTPException(status_code=403, detail="Access denied to this chat")

        chat_history = []
        for message in chat.get("messages", []):
            if message["role"] == "assistant":
                chat_history.append(message)
            elif message["role"] == "user":
                chat_history.append(message)

        aiResponse = MessageBase(content="", role="assistant")
        metadata = MessageBase(content="", role="metadata")

        for chunk in llm.query(userMessage.content, chat["document_ids"], chat_history):
            if "content" in chunk:
                aiResponse.content += chunk["content"]
                yield f"data: {json.dumps({'content': chunk['content']})}\n\n"
            elif "metadata" in chunk:
                metadata.content = chunk["metadata"]
                yield f"data: {json.dumps({'metadata': chunk['metadata']})}\n\n"

        updateChat(chatId, userMessage, chatCollection)
        if len(metadata.content) > 0:
            updateChat(chatId, metadata, chatCollection)
        updateChat(chatId, aiResponse, chatCollection)

    else:
        raise HTTPException(status_code=404, detail="Chat not found")


def addDocumentToChat(
    chatId: str,
    documentId: UUID,
    loggedInUser,
    chatCollection: Collection,
    db: Client,
):
    userId = UUID(loggedInUser.id)
    query = {"_id": ObjectId(chatId)}
    chat = chatCollection.find_one(query, {"document_ids": 1, "user_id": 1})
    if chat:
        if chat["user_id"] != userId:
            raise HTTPException(status_code=403, detail="Access denied to this chat")

        if documentId in chat.get("document_ids", []):
            raise HTTPException(
                status_code=400, detail="Document already added to this chat"
            )

        if len(chat.get("document_ids", [])) >= 5:
            raise HTTPException(
                status_code=400, detail="Maximum of 5 documents can be added to a chat"
            )

        response = (
            db.table("documents").select("id").eq("id", str(documentId)).execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="Document not found")

        update = {"$push": {"document_ids": documentId}}
        result = chatCollection.update_one(query, update)
        if result.modified_count == 0:
            raise HTTPException(
                status_code=500, detail="Failed to add document to chat"
            )

        return {"document_ids": chat["document_ids"] + [documentId]}
    else:
        raise HTTPException(status_code=404, detail="Chat not found")


def delelteDocumentFromChat(
    chatId: str, documentId: UUID, loggedInUser, chatCollection: Collection
):
    userId = UUID(loggedInUser.id)
    query = {"_id": ObjectId(chatId)}
    chat = chatCollection.find_one(query, {"document_ids": 1, "user_id": 1})
    if chat:
        if chat["user_id"] != userId:
            raise HTTPException(status_code=403, detail="Access denied to this chat")

        if documentId not in chat.get("document_ids", []):
            raise HTTPException(
                status_code=400, detail="Document not found in this chat"
            )

        update = {"$pull": {"document_ids": documentId}}
        result = chatCollection.update_one(query, update)
        if result.modified_count == 0:
            raise HTTPException(
                status_code=500, detail="Failed to remove document from chat"
            )

        updated_document_ids = [
            doc_id for doc_id in chat["document_ids"] if doc_id != documentId
        ]
        return {"document_ids": updated_document_ids}


def deleteChatById(chatId: str, loggedInUser, chatCollection: Collection):
    userId = UUID(loggedInUser.id)
    query = {"_id": ObjectId(chatId)}
    chat = chatCollection.find_one(query, {"messages": 0})
    if chat:
        if chat["user_id"] != userId:
            raise HTTPException(status_code=403, detail="Access denied to this chat")
        result = chatCollection.delete_one(query)
        if result.deleted_count == 0:
            raise HTTPException(status_code=500, detail="Failed to delete chat")
    else:
        raise HTTPException(status_code=404, detail="Chat not found")
    return {}
