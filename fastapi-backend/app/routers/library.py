from typing import Annotated
from uuid import UUID

from app.dependencies.authDependency import get_current_user
from app.dependencies.supabaseClient import get_supabase_client
from app.schemas.core import ApiResponse, BaseUser
from app.schemas.library import Library, LibraryItem
from app.services.library import (
    addDocumentToLibrary,
    deleteDocumentFromLibrary,
    getLibraryByUserId,
)
from fastapi import APIRouter, Depends
from supabase import Client

router = APIRouter(
    prefix="/libraries",
    tags=["library"],
)


@router.get("/")
def getLibrary(
    db: Annotated[Client, Depends(get_supabase_client)],
    loggedInUser: Annotated[BaseUser, Depends(get_current_user)],
) -> ApiResponse[list[Library]]:
    library = getLibraryByUserId(loggedInUser, db)
    return ApiResponse(
        success=True, data=library, message="Library fetched successfully"
    )


@router.post("/{documentId}")
def addToLibrary(
    documentId: UUID,
    db: Annotated[Client, Depends(get_supabase_client)],
    loggedInUser: Annotated[BaseUser, Depends(get_current_user)],
) -> ApiResponse[LibraryItem]:
    document = addDocumentToLibrary(loggedInUser, documentId, db)
    return ApiResponse(
        success=True, data=document, message="Document added to library successfully"
    )


@router.delete("/{documentId}")
def deleteFromLibrary(
    documentId: UUID,
    db: Annotated[Client, Depends(get_supabase_client)],
    loggedInUser: Annotated[BaseUser, Depends(get_current_user)],
) -> ApiResponse[LibraryItem]:
    document = deleteDocumentFromLibrary(loggedInUser, documentId, db)
    return ApiResponse(
        success=True,
        data=document,
        message="Document removed from library successfully",
    )
