from app.dependencies.supabaseClient import get_supabase_client
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client

security = HTTPBearer(auto_error=False)


def get_current_user(
    db: Client = Depends(get_supabase_client),
    creds: HTTPAuthorizationCredentials | None = Depends(security),
):
    if not creds:
        raise HTTPException(
            status_code=401, detail="Authentication credentials were not provided"
        )
    token = creds.credentials
    if not token:
        raise HTTPException(status_code=401, detail="Authentication token is missing")
    response = db.auth.get_user(token)
    if not response.user:
        raise HTTPException(
            status_code=401, detail="Invalid authentication credentials"
        )
    return response.user
