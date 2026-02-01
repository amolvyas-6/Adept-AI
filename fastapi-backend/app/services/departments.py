from uuid import UUID
from fastapi import HTTPException

from supabase import Client


def getAllDepartments(universityId: UUID, db: Client):
    query = db.table("departments").select("*").eq("university_id", str(universityId))
    response = query.execute()
    return response.data


def getDepartmentById(deptId: UUID, db: Client):
    query = db.table("departments").select("*").eq("id", str(deptId)).maybe_single()
    response = query.execute()
    if not response:
        raise HTTPException(status_code=404, detail="Department not found")
    return response.data


def deleteDepartmentById(deptId: UUID, db: Client):
    query = db.table("departments").delete().eq("id", str(deptId))
    response = query.execute()
    if len(response.data) == 0:
        raise HTTPException(status_code=404, detail="Department not found")
    return response.data[0]
