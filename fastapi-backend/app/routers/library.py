from typing import Annotated
from uuid import UUID

from app.dependencies.auth_dependency import get_current_user
from app.dependencies.supabase_client import get_supabase_client
from app.schemas.core import ApiResponse, BaseUser
from app.schemas.library import Library, LibraryItem
from app.services.library import (
    add_documents_to_library,
    delete_document_from_library,
    get_library_by_user_id,
)
from fastapi import APIRouter, Depends
from supabase import Client

router = APIRouter(
    prefix="/libraries",
    tags=["library"],
)


@router.get("")
def get_library(
    db: Annotated[Client, Depends(get_supabase_client)],
    current_user: Annotated[BaseUser, Depends(get_current_user)],
) -> ApiResponse[list[Library]]:
    library = get_library_by_user_id(current_user, db)
    return ApiResponse(
        success=True, data=library, message="Library fetched successfully"
    )


@router.post("/{document_id}")
def add_to_library(
    document_id: UUID,
    db: Annotated[Client, Depends(get_supabase_client)],
    current_user: Annotated[BaseUser, Depends(get_current_user)],
) -> ApiResponse[LibraryItem]:
    document = add_documents_to_library(current_user, document_id, db)
    return ApiResponse(
        success=True, data=document, message="Document added to library successfully"
    )


@router.delete("/{document_id}")
def delete_from_library(
    document_id: UUID,
    db: Annotated[Client, Depends(get_supabase_client)],
    current_user: Annotated[BaseUser, Depends(get_current_user)],
) -> ApiResponse[LibraryItem]:
    document = delete_document_from_library(current_user, document_id, db)
    return ApiResponse(
        success=True,
        data=document,
        message="Document removed from library successfully",
    )
