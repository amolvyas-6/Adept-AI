from uuid import UUID

from app.schemas.core import BaseUser
from app.schemas.profiles import UpdateProfileBody, UserProfile
from fastapi import HTTPException
from supabase import Client


def getProfileById(userId: UUID, loggedInUser: BaseUser, db: Client) -> UserProfile:
    if loggedInUser.id != userId:
        raise HTTPException(status_code=403, detail="Forbidden")

    query = db.table("profiles").select("*").eq("user_id", str(userId))
    response = query.execute()
    if len(response.data) == 0:
        raise HTTPException(status_code=404, detail="Profile not found")

    return UserProfile.model_validate(response.data[0])


def updateProfileById(
    userId: UUID, updateData: UpdateProfileBody, loggedInUser: BaseUser, db: Client
) -> UserProfile:
    if loggedInUser.id != userId:
        raise HTTPException(status_code=403, detail="Forbidden")

    updates = {}
    if updateData.fullName is not None:
        updates["full_name"] = updateData.fullName
    if updateData.deptId is not None:
        updates["dept_id"] = str(updateData.deptId)

    if len(updates) == 0:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    query = db.table("profiles").update(updates).eq("user_id", str(userId))
    response = query.execute()

    if len(response.data) == 0:
        raise HTTPException(status_code=404, detail="Profile not found")

    return UserProfile.model_validate(response.data[0])
