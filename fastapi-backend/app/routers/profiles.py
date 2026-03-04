from typing import Annotated
from uuid import UUID

from app.dependencies.authDependency import get_current_user
from app.dependencies.supabaseClient import get_supabase_client
from app.schemas.core import ApiResponse, BaseUser
from app.schemas.profiles import UpdateProfileBody, UserProfile
from app.services.profiles import getProfileById, updateProfileById
from fastapi import APIRouter, Depends
from supabase import Client

router = APIRouter(
    prefix="/profiles",
    tags=["profiles"],
)


@router.get("/{userId}")
async def getProfile(
    userId: UUID,
    db: Annotated[Client, Depends(get_supabase_client)],
    loggedInUser: Annotated[BaseUser, Depends(get_current_user)],
) -> ApiResponse[UserProfile]:
    profile = getProfileById(userId, loggedInUser, db)
    return ApiResponse(
        success=True, data=profile, message="Profile retrieved successfully"
    )


@router.patch("/{userId}")
async def updateProfile(
    userId: UUID,
    updateData: UpdateProfileBody,
    db: Annotated[Client, Depends(get_supabase_client)],
    loggedInUser: Annotated[BaseUser, Depends(get_current_user)],
) -> ApiResponse[UserProfile]:
    profile = updateProfileById(userId, updateData, loggedInUser, db)
    return ApiResponse(
        success=True, data=profile, message="Profile updated successfully"
    )
