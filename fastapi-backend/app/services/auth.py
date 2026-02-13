from app.schemas.auth import RegisterUser
from fastapi import HTTPException
from supabase import Client


def registerNewUser(userData: RegisterUser, db: Client):
    response = db.auth.admin.create_user(
        {
            "email": userData.email,
            "password": userData.password,
            "email_confirm": True,
        }
    )
    if not response.user:
        raise HTTPException(status_code=400, detail="User registration failed")

    userId = response.user.id
    print(userId)
    query = db.table("profiles").insert(
        {
            "user_id": str(userId),
            "full_name": userData.fullName,
            "dept_id": str(userData.deptId),
            "university_id": str(userData.universityId),
        }
    )
    result = query.execute()
    if len(result.data) == 0:
        raise HTTPException(status_code=400, detail="Failed to create user profile")

    return result.data[0]


def removeUser(user_id: str, db: Client):
    response = db.auth.admin.delete_user(user_id)
    if response.get("error"):
        raise HTTPException(status_code=400, detail="User deletion failed")

    return None
