from uuid import UUID

from app.dependencies.authDependency import get_current_user
from app.dependencies.supabaseClient import get_supabase_client
from app.schemas.university import UniversityCreate, UniversityUpdate
from app.services.university import (
    createNewUniversity,
    deleteUniversityById,
    getAllUniversities,
    getUniversityById,
    updateUniversityById,
)
from fastapi import APIRouter, Depends

router = APIRouter(prefix="/universities", tags=["universities"])


@router.get("/")
def listUniversities(db=Depends(get_supabase_client)):
    universities = getAllUniversities(db)
    return {
        "success": True,
        "data": universities,
        "message": "Universities fetched successfully",
    }


@router.get("/{universityId}")
def getUniversity(universityId: UUID, db=Depends(get_supabase_client)):
    university = getUniversityById(universityId, db)
    return {
        "success": True,
        "data": university,
        "message": "University fetched successfully",
    }


@router.post("/")
def createUniversity(
    universityData: UniversityCreate,
    db=Depends(get_supabase_client),
    _=Depends(get_current_user),
):
    newUniversity = createNewUniversity(universityData, db)
    return {
        "success": True,
        "data": newUniversity,
        "message": "University created successfully",
    }


@router.patch("/{universityId}")
def updateUniversity(
    universityId: UUID,
    universityData: UniversityUpdate,
    db=Depends(get_supabase_client),
    _=Depends(get_current_user),
):
    updatedUniversity = updateUniversityById(universityId, universityData, db)
    return {
        "success": True,
        "data": updatedUniversity,
        "message": "University updated successfully",
    }


@router.delete("/{universityId}")
def deleteUniversity(
    universityId: UUID, db=Depends(get_supabase_client), _=Depends(get_current_user)
):
    deletedUniversity = deleteUniversityById(universityId, db)
    return {
        "success": True,
        "data": deletedUniversity,
        "message": "University deleted successfully",
    }
