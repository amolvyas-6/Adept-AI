from typing import Annotated
from uuid import UUID

from app.dependencies.auth_dependency import get_current_user, get_incomplete_user
from app.dependencies.supabase_client import get_supabase_client
from app.schemas.core import ApiResponse, BaseUser
from app.schemas.profiles import CreateProfileBody, UpdateProfileBody, UserProfile
from app.services.profiles import (
    create_user_profile,
    get_profile_by_id,
    update_profile_by_id,
)
from fastapi import APIRouter, Depends
from supabase import Client

router = APIRouter(
    prefix="/profiles",
    tags=["profiles"],
)


@router.get("/{user_id}")
async def get_profile(
    user_id: UUID,
    db: Annotated[Client, Depends(get_supabase_client)],
    current_user: Annotated[BaseUser, Depends(get_current_user)],
) -> ApiResponse[UserProfile]:
    profile = get_profile_by_id(user_id, current_user, db)
    return ApiResponse(
        success=True, data=profile, message="Profile retrieved successfully"
    )


@router.post("/complete-profile")
async def create_profile(
    user_data: CreateProfileBody,
    db: Annotated[Client, Depends(get_supabase_client)],
    current_user: Annotated[BaseUser, Depends(get_incomplete_user)],
) -> ApiResponse[UserProfile]:
    profile = create_user_profile(user_data, current_user, db)
    return ApiResponse(
        success=True, data=profile, message="Profile created successfully"
    )


@router.patch("/{user_id}")
async def update_profile(
    user_id: UUID,
    update_data: UpdateProfileBody,
    db: Annotated[Client, Depends(get_supabase_client)],
    current_user: Annotated[BaseUser, Depends(get_current_user)],
) -> ApiResponse[UserProfile]:
    profile = update_profile_by_id(user_id, update_data, current_user, db)
    return ApiResponse(
        success=True, data=profile, message="Profile updated successfully"
    )
