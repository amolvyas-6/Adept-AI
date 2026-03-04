from uuid import UUID

from app.schemas.core import BaseUser
from app.schemas.library import Library, LibraryItem
from fastapi import HTTPException
from supabase import Client


def getLibraryByUserId(loggedInUser: BaseUser, db: Client) -> list[Library]:
    userId = loggedInUser.id
    query = (
        db.table("library")
        .select(
            "*, documents(title, unit, id, profiles!documents_user_id_fkey1(full_name), courses(code, name))"
        )
        .eq("user_id", str(userId))
    )
    response = query.execute()

    flattenedData = []
    for item in response.data:
        flattenedData.append(
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

    return [Library.model_validate(item) for item in flattenedData]


def addDocumentToLibrary(
    loggedInUser: BaseUser, documentId: UUID, db: Client
) -> LibraryItem:
    userId = loggedInUser.id
    query = db.table("library").insert(
        {"user_id": str(userId), "document_id": str(documentId)}
    )
    response = query.execute()
    if len(response.data) == 0:
        raise HTTPException(status_code=400, detail="Failed to add document to library")

    return LibraryItem.model_validate(response.data[0])


def deleteDocumentFromLibrary(
    loggedInUser: BaseUser, documentId: UUID, db: Client
) -> LibraryItem:
    userId = loggedInUser.id
    query = (
        db.table("library")
        .delete()
        .eq("user_id", str(userId))
        .eq("document_id", str(documentId))
    )
    response = query.execute()
    if len(response.data) == 0:
        raise HTTPException(
            status_code=400, detail="Failed to remove document from library"
        )

    return LibraryItem.model_validate(response.data[0])
