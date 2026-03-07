from typing import Annotated
from uuid import UUID

from app.dependencies.auth_dependency import get_current_user
from app.dependencies.supabase_client import get_supabase_client
from app.schemas.core import ApiResponse, BaseUser
from app.schemas.departments import (
    CreateDepartmentBody,
    Department,
    UpdateDepartmentBody,
)
from app.services.departments import (
    create_new_department,
    delete_department_by_id,
    get_all_departments,
    get_department_by_id,
    update_department_by_id,
)
from fastapi import APIRouter, Depends
from supabase import Client

router = APIRouter(
    prefix="/departments",
    tags=["departments"],
)


@router.get("")
def list_departments(
    university_id: UUID, db: Annotated[Client, Depends(get_supabase_client)]
) -> ApiResponse[list[Department]]:
    departments = get_all_departments(university_id, db)
    return ApiResponse(
        success=True,
        data=departments,
        message="Departments fetched successfully",
    )


@router.get("/{dept_id}")
def get_department(
    dept_id: UUID, db: Annotated[Client, Depends(get_supabase_client)]
) -> ApiResponse[Department]:
    department = get_department_by_id(dept_id, db)
    return ApiResponse(
        success=True,
        data=department,
        message="Department fetched successfully",
    )


@router.post("")
def create_department(
    dept_data: CreateDepartmentBody,
    db: Annotated[Client, Depends(get_supabase_client)],
    _: Annotated[BaseUser, Depends(get_current_user)],
) -> ApiResponse[Department]:
    new_department = create_new_department(dept_data, db)
    return ApiResponse(
        success=True,
        data=new_department,
        message="Department created successfully",
    )


@router.patch("/{dept_id}")
def update_department(
    dept_id: UUID,
    dept_data: UpdateDepartmentBody,
    db: Annotated[Client, Depends(get_supabase_client)],
    _: Annotated[BaseUser, Depends(get_current_user)],
) -> ApiResponse[Department]:
    updated_department = update_department_by_id(dept_id, dept_data, db)
    return ApiResponse(
        success=True,
        data=updated_department,
        message="Department updated successfully",
    )


@router.delete("/{dept_id}")
def delete_department(
    dept_id: UUID,
    db: Annotated[Client, Depends(get_supabase_client)],
    _: Annotated[BaseUser, Depends(get_current_user)],
) -> ApiResponse[Department]:
    deleted_department = delete_department_by_id(dept_id, db)
    return ApiResponse(
        success=True,
        data=deleted_department,
        message="Department deleted successfully",
    )
