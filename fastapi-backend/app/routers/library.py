from fastapi import APIRouter, Depends
from app.dependencies.authDependency import get_current_user
from app.dependencies.supabaseClient import get_supabase_client
from uuid import UUID
from app.services.library import (
    getLibraryByUserId,
    addDocumentToLibrary,
    deleteDocumentFromLibrary,
)

router = APIRouter(
    prefix="/libraries",
    tags=["library"],
)


@router.get("/")
def getLibrary(
    db=Depends(get_supabase_client),
    loggedInUser=Depends(get_current_user),
):
    library = getLibraryByUserId(loggedInUser, db)
    return {"success": True, "data": library, "message": "Library fetched successfully"}


@router.post("/{documentId}")
def addToLibrary(
    documentId: UUID,
    db=Depends(get_supabase_client),
    loggedInUser=Depends(get_current_user),
):
    document = addDocumentToLibrary(loggedInUser, documentId, db)
    return {
        "success": True,
        "data": document,
        "message": "Document added to library successfully",
    }


@router.delete("/{documentId}")
def deleteFromLibrary(
    documentId: UUID,
    db=Depends(get_supabase_client),
    loggedInUser=Depends(get_current_user),
):
    document = deleteDocumentFromLibrary(loggedInUser, documentId, db)
    return {
        "success": True,
        "data": document,
        "message": "Document removed from library successfully",
    }
