from uuid import UUID
from fastapi import HTTPException
from app.schemas.departments import DepartmentCreate, DepartmentUpdate

from supabase import Client


def getAllDepartments(universityId: UUID, db: Client):
    query = db.table("departments").select("*").eq("university_id", str(universityId))
    response = query.execute()
    return response.data


def getDepartmentById(deptId: UUID, db: Client):
    query = db.table("departments").select("*").eq("id", str(deptId))
    response = query.execute()
    if len(response.data) == 0:
        raise HTTPException(status_code=404, detail="Department not found")
    return response.data[0]


def createNewDepartment(dept: DepartmentCreate, db: Client):
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
    return response.data[0]


def updateDepartmentById(deptId: UUID, dept: DepartmentUpdate, db: Client):
    update_data = {}
    if dept.name is not None:
        update_data["name"] = dept.name
    if dept.abbreviation is not None:
        update_data["abbreviation"] = dept.abbreviation
    if dept.university_id is not None:
        update_data["university_id"] = str(dept.university_id)

    if len(update_data) == 0:
        raise HTTPException(status_code=400, detail="No fields to update provided")

    query = db.table("departments").update(update_data).eq("id", str(deptId))
    response = query.execute()
    if len(response.data) == 0:
        raise HTTPException(status_code=500, detail="Failed to update department")
    return response.data[0]


def deleteDepartmentById(deptId: UUID, db: Client):
    query = db.table("departments").delete().eq("id", str(deptId))
    response = query.execute()
    if len(response.data) == 0:
        raise HTTPException(status_code=404, detail="Department not found")
    return response.data[0]
