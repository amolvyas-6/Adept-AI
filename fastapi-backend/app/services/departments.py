from uuid import UUID

from app.schemas.departments import (
    CreateDepartmentBody,
    Department,
    UpdateDepartmentBody,
)
from fastapi import HTTPException
from supabase import Client


def get_all_departments(university_id: UUID, db: Client) -> list[Department]:
    query = db.table("departments").select("*").eq("university_id", str(university_id))
    response = query.execute()
    return [Department.model_validate(dept) for dept in response.data]


def get_department_by_id(dept_id: UUID, db: Client) -> Department:
    query = db.table("departments").select("*").eq("id", str(dept_id))
    response = query.execute()
    if len(response.data) == 0:
        raise HTTPException(status_code=404, detail="Department not found")
    return Department.model_validate(response.data[0])


def create_new_department(dept: CreateDepartmentBody, db: Client) -> Department:
    query = db.table("departments").insert(
        {
            "name": dept.name,
            "abbreviation": dept.abbreviation,
            "university_id": str(dept.university_id),
        }
    )
    response = query.execute()
    if len(response.data) == 0:
        raise HTTPException(status_code=500, detail="Failed to create department")
    return Department.model_validate(response.data[0])


def update_department_by_id(
    dept_id: UUID, dept: UpdateDepartmentBody, db: Client
) -> Department:
    update_data = {}
    if dept.name is not None:
        update_data["name"] = dept.name
    if dept.abbreviation is not None:
        update_data["abbreviation"] = dept.abbreviation
    if dept.university_id is not None:
        update_data["university_id"] = str(dept.university_id)

    if len(update_data) == 0:
        raise HTTPException(status_code=400, detail="No fields to update provided")

    query = db.table("departments").update(update_data).eq("id", str(dept_id))
    response = query.execute()
    if len(response.data) == 0:
        raise HTTPException(status_code=500, detail="Failed to update department")
    return Department.model_validate(response.data[0])


def delete_department_by_id(dept_id: UUID, db: Client) -> Department:
    query = db.table("departments").delete().eq("id", str(dept_id))
    response = query.execute()
    if len(response.data) == 0:
        raise HTTPException(status_code=404, detail="Department not found")
    return Department.model_validate(response.data[0])
