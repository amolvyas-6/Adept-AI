from uuid import UUID
from fastapi import APIRouter, Depends
from app.dependencies.supabaseClient import get_supabase_client
from app.services.departments import (
    deleteDepartmentById,
    getAllDepartments,
    getDepartmentById,
)

router = APIRouter(prefix="/departments", tags=["departments"])


@router.get("/")
def listDepartments(universityId: UUID, db=Depends(get_supabase_client)):
    departments = getAllDepartments(universityId, db)
    return {
        "success": True,
        "data": departments,
        "message": "Departments fetched successfully",
    }


@router.get("/{dept_id}")
def getDepartment(dept_id: UUID, db=Depends(get_supabase_client)):
    department = getDepartmentById(dept_id, db)
    return {
        "success": True,
        "data": department,
        "message": "Department fetched successfully",
    }


@router.delete("/{dept_id}")
def deleteDepartment(dept_id: UUID, db=Depends(get_supabase_client)):
    deletedDepartment = deleteDepartmentById(dept_id, db)
    return {
        "success": True,
        "data": deletedDepartment,
        "message": "Department deleted successfully",
    }
