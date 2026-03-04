from typing import Annotated
from uuid import UUID

from app.dependencies.authDependency import get_current_user
from app.dependencies.supabaseClient import get_supabase_client
from app.schemas.core import ApiResponse, BaseUser
from app.schemas.departments import (
    CreateDepartmentBody,
    Department,
    UpdateDepartmentBody,
)
from app.services.departments import (
    createNewDepartment,
    deleteDepartmentById,
    getAllDepartments,
    getDepartmentById,
    updateDepartmentById,
)
from fastapi import APIRouter, Depends
from supabase import Client

router = APIRouter(
    prefix="/departments",
    tags=["departments"],
)


@router.get("/")
def listDepartments(
    universityId: UUID, db: Annotated[Client, Depends(get_supabase_client)]
) -> ApiResponse[list[Department]]:
    departments = getAllDepartments(universityId, db)
    return ApiResponse(
        success=True,
        data=departments,
        message="Departments fetched successfully",
    )


@router.get("/{dept_id}")
def getDepartment(
    dept_id: UUID, db: Annotated[Client, Depends(get_supabase_client)]
) -> ApiResponse[Department]:
    department = getDepartmentById(dept_id, db)
    return ApiResponse(
        success=True,
        data=department,
        message="Department fetched successfully",
    )


@router.post("/")
def createDepartment(
    deptData: CreateDepartmentBody,
    db: Annotated[Client, Depends(get_supabase_client)],
    _: Annotated[BaseUser, Depends(get_current_user)],
) -> ApiResponse[Department]:
    newDepartment = createNewDepartment(deptData, db)
    return ApiResponse(
        success=True,
        data=newDepartment,
        message="Department created successfully",
    )


@router.patch("/{dept_id}")
def updateDepartment(
    dept_id: UUID,
    deptData: UpdateDepartmentBody,
    db: Annotated[Client, Depends(get_supabase_client)],
    _: Annotated[BaseUser, Depends(get_current_user)],
) -> ApiResponse[Department]:
    updatedDepartment = updateDepartmentById(dept_id, deptData, db)
    return ApiResponse(
        success=True,
        data=updatedDepartment,
        message="Department updated successfully",
    )


@router.delete("/{dept_id}")
def deleteDepartment(
    dept_id: UUID,
    db: Annotated[Client, Depends(get_supabase_client)],
    _: Annotated[BaseUser, Depends(get_current_user)],
) -> ApiResponse[Department]:
    deletedDepartment = deleteDepartmentById(dept_id, db)
    return ApiResponse(
        success=True,
        data=deletedDepartment,
        message="Department deleted successfully",
    )
