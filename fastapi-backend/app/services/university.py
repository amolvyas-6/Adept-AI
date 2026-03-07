from uuid import UUID

from app.schemas.university import (
    CreateUniversityBody,
    University,
    UpdateUniversityBody,
)
from fastapi import HTTPException
from supabase import Client


def get_all_universities(db: Client) -> list[University]:
    query = db.table("universities").select("*")
    response = query.execute()
    return [University.model_validate(university) for university in response.data]


def get_university_by_id(university_id: UUID, db: Client) -> University:
    query = db.table("universities").select("*").eq("id", str(university_id))
    response = query.execute()
    if len(response.data) == 0:
        raise HTTPException(status_code=404, detail="University not found")
    return University.model_validate(response.data[0])


def create_new_university(university: CreateUniversityBody, db: Client) -> University:
    query = db.table("universities").insert(
        {
            "name": university.name,
        }
    )
    response = query.execute()
    if len(response.data) == 0:
        raise HTTPException(status_code=500, detail="Failed to create university")
    return University.model_validate(response.data[0])


def update_university_by_id(
    university_id: UUID, university: UpdateUniversityBody, db: Client
) -> University:
    update_data = {}
    if university.name is not None:
        update_data["name"] = university.name

    if len(update_data) == 0:
        raise HTTPException(status_code=400, detail="No fields to update provided")

    query = db.table("universities").update(update_data).eq("id", str(university_id))
    response = query.execute()
    if len(response.data) == 0:
        raise HTTPException(status_code=500, detail="Failed to update university")
    return University.model_validate(response.data[0])


def delete_university_by_id(university_id: UUID, db: Client) -> University:
    query = db.table("universities").delete().eq("id", str(university_id))
    response = query.execute()
    if len(response.data) == 0:
        raise HTTPException(status_code=404, detail="University not found")
    return University.model_validate(response.data[0])
