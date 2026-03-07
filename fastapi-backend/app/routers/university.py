from typing import Annotated
from uuid import UUID

from app.dependencies.auth_dependency import get_current_user
from app.dependencies.supabase_client import get_supabase_client
from app.schemas.core import ApiResponse, BaseUser
from app.schemas.university import (
    CreateUniversityBody,
    University,
    UpdateUniversityBody,
)
from app.services.university import (
    create_new_university,
    delete_university_by_id,
    get_all_universities,
    get_university_by_id,
    update_university_by_id,
)
from fastapi import APIRouter, Depends
from supabase import Client

router = APIRouter(prefix="/universities", tags=["universities"])


@router.get("")
def list_universities(
    db: Annotated[Client, Depends(get_supabase_client)],
) -> ApiResponse[list[University]]:
    universities = get_all_universities(db)
    return ApiResponse(
        success=True,
        data=universities,
        message="Universities fetched successfully",
    )


@router.get("/{university_id}")
def get_university(
    university_id: UUID, db: Annotated[Client, Depends(get_supabase_client)]
) -> ApiResponse[University]:
    university = get_university_by_id(university_id, db)
    return ApiResponse(
        success=True,
        data=university,
        message="University fetched successfully",
    )


@router.post("")
def create_university(
    university_data: CreateUniversityBody,
    db: Annotated[Client, Depends(get_supabase_client)],
    _: Annotated[BaseUser, Depends(get_current_user)],
) -> ApiResponse[University]:
    new_university = create_new_university(university_data, db)
    return ApiResponse(
        success=True,
        data=new_university,
        message="University created successfully",
    )


@router.patch("/{university_id}")
def update_university(
    university_id: UUID,
    university_data: UpdateUniversityBody,
    db: Annotated[Client, Depends(get_supabase_client)],
    _: Annotated[BaseUser, Depends(get_current_user)],
) -> ApiResponse[University]:
    updated_university = update_university_by_id(university_id, university_data, db)
    return ApiResponse(
        success=True,
        data=updated_university,
        message="University updated successfully",
    )


@router.delete("/{university_id}")
def delete_university(
    university_id: UUID,
    db: Annotated[Client, Depends(get_supabase_client)],
    _: Annotated[BaseUser, Depends(get_current_user)],
) -> ApiResponse[University]:
    deleted_university = delete_university_by_id(university_id, db)
    return ApiResponse(
        success=True, data=deleted_university, message="University deleted successfully"
    )
