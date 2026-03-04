from typing import Annotated
from uuid import UUID

from app.dependencies.supabaseClient import get_supabase_client
from app.schemas.auth import RegisterUser
from app.schemas.core import ApiResponse
from app.schemas.profiles import UserProfile
from app.services.auth import registerNewUser, removeUser
from fastapi import APIRouter, Depends
from supabase import Client

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


@router.post("/register")
def registerUser(
    userData: RegisterUser, db: Annotated[Client, Depends(get_supabase_client)]
) -> ApiResponse[UserProfile]:
    user = registerNewUser(userData=userData, db=db)
    return ApiResponse(success=True, data=user, message="User registered successfully")


@router.delete("/{user_id}")
def deleteUser(
    user_id: UUID, db=Depends(get_supabase_client)
) -> ApiResponse[UserProfile]:
    user = removeUser(user_id, db)
    return ApiResponse(success=True, data=user, message="User deleted successfully")
