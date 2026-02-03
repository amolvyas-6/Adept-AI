from supabase import Client
from uuid import UUID
from fastapi import HTTPException
from app.schemas.profiles import ProfileUpdate


def getProfileById(userId: UUID, loggedInUser, db: Client):
    if loggedInUser.id != str(userId):
        raise HTTPException(status_code=403, detail="Forbidden")

    query = db.table("profiles").select("*").eq("user_id", str(userId))
    response = query.execute()
    if len(response.data) == 0:
        raise HTTPException(status_code=404, detail="Profile not found")

    return response.data[0]


def updateProfileById(
    userId: UUID, updateData: ProfileUpdate, loggedInUser, db: Client
):
    if loggedInUser.id != str(userId):
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

    return response.data[0]
