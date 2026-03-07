from uuid import UUID

from app.schemas.auth import RegisterUser
from app.schemas.profiles import UserProfile
from fastapi import HTTPException
from pymongo.collection import Collection
from supabase import Client


def register_new_user(userData: RegisterUser, db: Client) -> None:
    response = db.auth.admin.create_user(
        {
            "email": userData.email,
            "password": userData.password,
            "email_confirm": True,
        }
    )
    if not response.user:
        raise HTTPException(status_code=400, detail="User registration failed")

    return None


def remove_user(
    user_id: UUID, db: Client, chat_collection: Collection
) -> UserProfile | None:

    profile = db.table("profiles").select("*").eq("user_id", str(user_id)).execute()

    # Delete user-related data from MongoDB
    chat_collection.delete_many({"user_id": str(user_id)})

    response = db.auth.admin.delete_user(str(user_id))

    return UserProfile.model_validate(profile.data[0]) if profile.data else None
