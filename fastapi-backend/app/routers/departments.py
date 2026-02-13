from uuid import UUID

from app.dependencies.authDependency import get_current_user
from app.dependencies.supabaseClient import get_supabase_client
from app.schemas.departments import DepartmentCreate, DepartmentUpdate
from app.services.departments import (
    createNewDepartment,
    deleteDepartmentById,
    getAllDepartments,
    getDepartmentById,
    updateDepartmentById,
)
from fastapi import APIRouter, Depends

router = APIRouter(
    prefix="/departments",
    tags=["departments"],
)


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


@router.post("/")
def createDepartment(
    deptData: DepartmentCreate,
    db=Depends(get_supabase_client),
    _=Depends(get_current_user),
):
    newDepartment = createNewDepartment(deptData, db)
    return {
        "success": True,
        "data": newDepartment,
        "message": "Department created successfully",
    }


@router.patch("/{dept_id}")
def updateDepartment(
    dept_id: UUID,
    deptData: DepartmentUpdate,
    db=Depends(get_supabase_client),
    _=Depends(get_current_user),
):
    updatedDepartment = updateDepartmentById(dept_id, deptData, db)
    return {
        "success": True,
        "data": updatedDepartment,
        "message": "Department updated successfully",
    }


@router.delete("/{dept_id}")
def deleteDepartment(
    dept_id: UUID, db=Depends(get_supabase_client), _=Depends(get_current_user)
):
    deletedDepartment = deleteDepartmentById(dept_id, db)
    return {
        "success": True,
        "data": deletedDepartment,
        "message": "Department deleted successfully",
    }
