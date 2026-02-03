from supabase import Client
from uuid import UUID


def getLibraryByUserId(loggedInUser, db: Client):
    userId = loggedInUser.id
    query = (
        db.table("library")
        .select(
            "*, documents(title, unit, id, profiles(full_name), courses(code, name))"
        )
        .eq("user_id", str(userId))
    )
    response = query.execute()
    if len(response.data) == 0:
        return []

    flattenedData = []
    for item in response.data:
        flattenedData.append(
            {
                "id": item["id"],
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

    return flattenedData


def addDocumentToLibrary(loggedInUser, documentId: UUID, db: Client):
    userId = loggedInUser.id
    query = db.table("library").insert(
        {"user_id": str(userId), "document_id": str(documentId)}
    )
    response = query.execute()
    if len(response.data) == 0:
        return None

    return response.data[0]


def deleteDocumentFromLibrary(loggedInUser, documentId: UUID, db: Client):
    userId = loggedInUser.id
    query = (
        db.table("library")
        .delete()
        .eq("user_id", str(userId))
        .eq("document_id", str(documentId))
    )
    response = query.execute()
    if len(response.data) == 0:
        return None

    return response.data[0]
