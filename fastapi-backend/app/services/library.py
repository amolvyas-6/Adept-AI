from uuid import UUID

from app.schemas.core import BaseUser
from app.schemas.library import Library, LibraryItem
from fastapi import HTTPException
from supabase import Client


def get_library_by_user_id(current_user: BaseUser, db: Client) -> list[Library]:
    user_id = current_user.id
    query = (
        db.table("library")
        .select(
            "*, documents(title, unit, id, profiles!documents_user_id_fkey1(full_name), courses(code, name))"
        )
        .eq("user_id", str(user_id))
    )
    response = query.execute()

    flattened_data = []
    data: list[dict] = response.data  # type: ignore
    for item in data:
        flattened_data.append(
            {
                "saved_at": item["created_at"],
                "document_id": item["documents"]["id"],
                "title": item["documents"]["title"],
                "unit": item["documents"]["unit"],
                "uploader": (
                    item["documents"]["profiles"]["full_name"]
                    if item["documents"]["profiles"]
                    else None
                ),
                "course_code": item["documents"]["courses"]["code"],
                "course_name": item["documents"]["courses"]["name"],
            }
        )

    return [Library.model_validate(item) for item in flattened_data]


def add_documents_to_library(
    current_user: BaseUser, document_id: UUID, db: Client
) -> LibraryItem:
    user_id = current_user.id
    query = db.table("library").insert(
        {"user_id": str(user_id), "document_id": str(document_id)}
    )
    response = query.execute()
    if len(response.data) == 0:
        raise HTTPException(status_code=400, detail="Failed to add document to library")

    return LibraryItem.model_validate(response.data[0])


def delete_document_from_library(
    current_user: BaseUser, document_id: UUID, db: Client
) -> LibraryItem:
    user_id = current_user.id
    query = (
        db.table("library")
        .delete()
        .eq("user_id", str(user_id))
        .eq("document_id", str(document_id))
    )
    response = query.execute()
    if len(response.data) == 0:
        raise HTTPException(
            status_code=400, detail="Failed to remove document from library"
        )

    return LibraryItem.model_validate(response.data[0])
