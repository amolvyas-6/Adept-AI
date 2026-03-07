from typing import Annotated
from uuid import UUID

from app.dependencies.auth_dependency import get_current_user
from app.dependencies.mongo_client import get_chat_collection
from app.dependencies.supabase_client import get_supabase_client
from app.schemas.auth import RegisterUser
from app.schemas.core import ApiResponse, BaseUser
from app.schemas.profiles import UserProfile
from app.services.auth import register_new_user, remove_user
from fastapi import APIRouter, Depends
from pymongo.collection import Collection
from supabase import Client

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


@router.post("/register")
def register_user(
    user_data: RegisterUser, db: Annotated[Client, Depends(get_supabase_client)]
) -> ApiResponse[None]:
    user = register_new_user(userData=user_data, db=db)
    return ApiResponse(success=True, data=user, message="User registered successfully")


@router.delete("")
def delete_user(
    db: Annotated[Client, Depends(get_supabase_client)],
    chat_collection: Annotated[Collection, Depends(get_chat_collection)],
    logged_in_user: Annotated[BaseUser, Depends(get_current_user)],
) -> ApiResponse[UserProfile]:
    user = remove_user(logged_in_user.id, db, chat_collection)
    return ApiResponse(success=True, data=user, message="User deleted successfully")
