from typing import Annotated

from app.dependencies.supabase_client import get_supabase_client
from app.schemas.core import BaseUser
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client

security = HTTPBearer()


def get_current_user(
    db: Annotated[Client, Depends(get_supabase_client)],
    creds: Annotated[HTTPAuthorizationCredentials, Depends(security)],
):
    token = creds.credentials
    response = db.auth.get_user(token)
    if not response or not response.user:
        raise HTTPException(
            status_code=401, detail="Invalid authentication credentials"
        )

    user_id = response.user.id
    profile_response = (
        db.table("profiles").select("*").eq("user_id", str(user_id)).execute()
    )
    if len(profile_response.data) == 0:
        raise HTTPException(status_code=404, detail="User profile not completed")

    return BaseUser.model_validate(response.user, from_attributes=True)


def get_incomplete_user(
    db: Annotated[Client, Depends(get_supabase_client)],
    creds: Annotated[HTTPAuthorizationCredentials, Depends(security)],
):
    token = creds.credentials
    response = db.auth.get_user(token)
    if not response or not response.user:
        raise HTTPException(
            status_code=401, detail="Invalid authentication credentials"
        )

    return BaseUser.model_validate(response.user, from_attributes=True)
