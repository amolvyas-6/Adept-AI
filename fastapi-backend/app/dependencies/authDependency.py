from typing import Annotated

from app.dependencies.supabaseClient import get_supabase_client
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
    if not response.user:
        raise HTTPException(
            status_code=401, detail="Invalid authentication credentials"
        )

    return BaseUser(
        id=response.user.id,
        email=response.user.email,
        created_at=response.user.created_at,
        updated_at=response.user.updated_at,
    )
