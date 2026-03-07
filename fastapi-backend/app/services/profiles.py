from uuid import UUID

from app.schemas.core import BaseUser
from app.schemas.profiles import CreateProfileBody, UpdateProfileBody, UserProfile
from fastapi import HTTPException
from supabase import Client


def get_profile_by_id(user_id: UUID, current_user: BaseUser, db: Client) -> UserProfile:
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    query = db.table("profiles").select("*").eq("user_id", str(user_id))
    response = query.execute()
    if len(response.data) == 0:
        raise HTTPException(status_code=404, detail="Profile not found")

    return UserProfile.model_validate(response.data[0])


def create_user_profile(
    user_data: CreateProfileBody, current_user: BaseUser, db: Client
) -> UserProfile:
    user_id = current_user.id
    query = db.table("profiles").insert(
        {
            "user_id": str(user_id),
            "full_name": user_data.fullName,
            "dept_id": str(user_data.dept_id),
            "university_id": str(user_data.university_id),
        }
    )
    result = query.execute()
    if len(result.data) == 0:
        raise HTTPException(status_code=400, detail="Failed to create user profile")

    return UserProfile.model_validate(result.data[0])


def update_profile_by_id(
    user_id: UUID, update_data: UpdateProfileBody, current_user: BaseUser, db: Client
) -> UserProfile:
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    updates = {}
    if update_data.full_name is not None:
        updates["full_name"] = update_data.full_name
    if update_data.dept_id is not None:
        updates["dept_id"] = str(update_data.dept_id)

    if len(updates) == 0:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    query = db.table("profiles").update(updates).eq("user_id", str(user_id))
    response = query.execute()

    if len(response.data) == 0:
        raise HTTPException(status_code=404, detail="Profile not found")

    return UserProfile.model_validate(response.data[0])
