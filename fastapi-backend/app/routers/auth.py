from app.dependencies.supabaseClient import get_supabase_client
from app.schemas.auth import RegisterUser
from app.services.auth import registerNewUser, removeUser
from fastapi import APIRouter, Depends

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


@router.post("/register")
def registerUser(userData: RegisterUser, db=Depends(get_supabase_client)):
    user = registerNewUser(userData, db)
    return {"success": True, "data": user, "message": "User registered successfully"}


@router.delete("/{user_id}")
def deleteUser(user_id: str, db=Depends(get_supabase_client)):
    user = removeUser(user_id, db)
    return {"success": True, "data": user, "message": "User deleted successfully"}
