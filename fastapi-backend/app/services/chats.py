import json
from uuid import UUID

from app.schemas.chats import (
    Chat,
    ChatDocuments,
    ChatMetadata,
    MessageBase,
    MetadataMessage,
)
from app.schemas.core import BaseUser
from app.utils.agent import LLM
from bson import ObjectId
from fastapi import HTTPException
from pymongo.collection import Collection
from supabase import Client


def get_user_chats(
    chat_collection: Collection, current_user: BaseUser
) -> list[ChatMetadata]:
    user_id = current_user.id
    query = {"user_id": user_id}
    filters = {"_id": 1, "title": 1, "document_ids": 1}
    chats_cursor = chat_collection.find(query, filters)
    chats = []
    for chat in chats_cursor:
        chats.append(chat)
    print(chats)
    return [ChatMetadata.model_validate(chat) for chat in chats]


def get_chat_by_id(
    chat_id: str, current_user: BaseUser, chat_collection: Collection
) -> Chat:
    user_id = current_user.id
    query = {"_id": ObjectId(chat_id)}
    chat = chat_collection.find_one(query)
    if chat:
        if chat["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Access denied to this chat")
    else:
        raise HTTPException(status_code=404, detail="Chat not found")
    return Chat.model_validate(chat)


def create_new_chat(
    document_id: UUID, current_user: BaseUser, chat_collection: Collection, db: Client
) -> Chat:
    user_id = current_user.id

    response = db.table("documents").select("id").eq("id", str(document_id)).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Document not found")

    new_chat = Chat(user_id=user_id, document_ids=[document_id], messages=[])
    result = chat_collection.insert_one(new_chat.model_dump(exclude={"id"}))
    if not result.acknowledged:
        raise HTTPException(status_code=500, detail="Failed to create chat")

    return get_chat_by_id(str(result.inserted_id), current_user, chat_collection)


def update_chat(
    chat_id: str, message: MessageBase | MetadataMessage, chat_collection: Collection
):
    query = {"_id": ObjectId(chat_id)}
    update = {"$push": {"messages": message.model_dump()}}
    result = chat_collection.update_one(query, update)
    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to update chat")


def add_message_to_chat(
    chat_id: str,
    user_message: MessageBase,
    llm: LLM,
    current_user: BaseUser,
    chat_collection: Collection,
):
    user_id = current_user.id
    chat = get_chat_by_id(chat_id, current_user, chat_collection)
    if chat.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied to this chat")

    chat_history = []
    for message in chat.messages:
        if message.role == "assistant":
            chat_history.append(message.model_dump())
        elif message.role == "user":
            chat_history.append(message.model_dump())

    ai_response = MessageBase(content="", role="assistant")
    metadata = MetadataMessage(content=[], role="metadata")

    for chunk in llm.query(user_message.content, chat.document_ids, chat_history):
        if "content" in chunk:
            ai_response.content += chunk["content"]  # type: ignore
            yield f"data: {json.dumps({'content': chunk['content']})}\n\n"
        elif "metadata" in chunk:
            metadata.content = chunk["metadata"]  # type: ignore
            yield f"data: {json.dumps({'metadata': chunk['metadata']})}\n\n"

    update_chat(chat_id, user_message, chat_collection)
    if len(metadata.content) > 0:
        update_chat(chat_id, metadata, chat_collection)
    update_chat(chat_id, ai_response, chat_collection)


def add_document_to_chat(
    chat_id: str,
    document_id: UUID,
    current_user: BaseUser,
    chat_collection: Collection,
    db: Client,
) -> ChatDocuments:
    user_id = current_user.id
    query = {"_id": ObjectId(chat_id)}
    chat = chat_collection.find_one(query, {"document_ids": 1, "user_id": 1})
    if chat:
        if chat["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Access denied to this chat")

        if document_id in chat.get("document_ids", []):
            raise HTTPException(
                status_code=400, detail="Document already added to this chat"
            )

        if len(chat.get("document_ids", [])) >= 5:
            raise HTTPException(
                status_code=400, detail="Maximum of 5 documents can be added to a chat"
            )

        response = (
            db.table("documents").select("id").eq("id", str(document_id)).execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="Document not found")

        update = {"$push": {"document_ids": document_id}}
        result = chat_collection.update_one(query, update)
        if result.modified_count == 0:
            raise HTTPException(
                status_code=500, detail="Failed to add document to chat"
            )

        new_document_ids = chat["document_ids"] + [document_id]
        return ChatDocuments.model_validate({"document_ids": new_document_ids})
    else:
        raise HTTPException(status_code=404, detail="Chat not found")


def delete_documents_from_chat(
    chat_id: str, document_id: UUID, current_user: BaseUser, chat_collection: Collection
) -> ChatDocuments:
    user_id = current_user.id
    query = {"_id": ObjectId(chat_id)}
    chat = chat_collection.find_one(query, {"document_ids": 1, "user_id": 1})
    if chat:
        if chat["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Access denied to this chat")

        if document_id not in chat.get("document_ids", []):
            raise HTTPException(
                status_code=400, detail="Document not found in this chat"
            )

        update = {"$pull": {"document_ids": document_id}}
        result = chat_collection.update_one(query, update)
        if result.modified_count == 0:
            raise HTTPException(
                status_code=500, detail="Failed to remove document from chat"
            )

        updated_document_ids = [
            doc_id for doc_id in chat["document_ids"] if doc_id != document_id
        ]
        return ChatDocuments.model_validate({"document_ids": updated_document_ids})
    else:
        raise HTTPException(status_code=404, detail="Chat not found")


def delete_chat_by_id(
    chat_id: str, current_user: BaseUser, chat_collection: Collection
) -> None:
    user_id = current_user.id
    query = {"_id": ObjectId(chat_id)}
    chat = chat_collection.find_one(query, {"messages": 0})
    if chat:
        if chat["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Access denied to this chat")
        result = chat_collection.delete_one(query)
        if result.deleted_count == 0:
            raise HTTPException(status_code=500, detail="Failed to delete chat")
    else:
        raise HTTPException(status_code=404, detail="Chat not found")
    return
