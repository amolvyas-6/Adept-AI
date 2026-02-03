from fastapi import APIRouter, Depends
from app.dependencies.authDependency import get_current_user
from app.dependencies.supabaseClient import get_supabase_client
from uuid import UUID
from app.services.profiles import getProfileById, updateProfileById
from app.schemas.profiles import ProfileUpdate

router = APIRouter(
    prefix="/profiles",
    tags=["profiles"],
)


@router.get("/{userId}")
async def getProfile(
    userId: UUID,
    db=Depends(get_supabase_client),
    loggedInUser=Depends(get_current_user),
):
    profile = getProfileById(userId, loggedInUser, db)
    return {"success": True, "data": profile, "message": "Profile fetched successfully"}


@router.patch("/{userId}")
async def updateProfile(
    userId: UUID,
    updateData: ProfileUpdate,
    db=Depends(get_supabase_client),
    loggedInUser=Depends(get_current_user),
):
    profile = updateProfileById(userId, updateData, loggedInUser, db)
    return {"success": True, "data": profile, "message": "Profile updated successfully"}
