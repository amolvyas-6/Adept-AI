from typing import Annotated
from uuid import UUID

from app.dependencies.authDependency import get_current_user
from app.dependencies.supabaseClient import get_supabase_client
from app.schemas.core import ApiResponse, BaseUser
from app.schemas.university import (
    CreateUniversityBody,
    University,
    UpdateUniversityBody,
)
from app.services.university import (
    createNewUniversity,
    deleteUniversityById,
    getAllUniversities,
    getUniversityById,
    updateUniversityById,
)
from fastapi import APIRouter, Depends
from supabase import Client

router = APIRouter(prefix="/universities", tags=["universities"])


@router.get("/")
def listUniversities(
    db: Annotated[Client, Depends(get_supabase_client)],
) -> ApiResponse[list[University]]:
    universities = getAllUniversities(db)
    return ApiResponse(
        success=True,
        data=universities,
        message="Universities fetched successfully",
    )


@router.get("/{universityId}")
def getUniversity(
    universityId: UUID, db: Annotated[Client, Depends(get_supabase_client)]
) -> ApiResponse[University]:
    university = getUniversityById(universityId, db)
    return ApiResponse(
        success=True,
        data=university,
        message="University fetched successfully",
    )


@router.post("/")
def createUniversity(
    universityData: CreateUniversityBody,
    db: Annotated[Client, Depends(get_supabase_client)],
    _: Annotated[BaseUser, Depends(get_current_user)],
) -> ApiResponse[University]:
    newUniversity = createNewUniversity(universityData, db)
    return ApiResponse(
        success=True,
        data=newUniversity,
        message="University created successfully",
    )


@router.patch("/{universityId}")
def updateUniversity(
    universityId: UUID,
    universityData: UpdateUniversityBody,
    db: Annotated[Client, Depends(get_supabase_client)],
    _: Annotated[BaseUser, Depends(get_current_user)],
) -> ApiResponse[University]:
    updatedUniversity = updateUniversityById(universityId, universityData, db)
    return ApiResponse(
        success=True,
        data=updatedUniversity,
        message="University updated successfully",
    )


@router.delete("/{universityId}")
def deleteUniversity(
    universityId: UUID,
    db: Annotated[Client, Depends(get_supabase_client)],
    _: Annotated[BaseUser, Depends(get_current_user)],
) -> ApiResponse[University]:
    deletedUniversity = deleteUniversityById(universityId, db)
    return ApiResponse(
        success=True, data=deletedUniversity, message="University deleted successfully"
    )
