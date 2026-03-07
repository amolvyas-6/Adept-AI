from typing import Annotated
from uuid import UUID

from app.dependencies.auth_dependency import get_current_user
from app.dependencies.supabase_client import get_supabase_client
from app.schemas.core import ApiResponse
from app.schemas.courses import (
    Course,
    CourseDataLink,
    CourseWithDepartment,
    CreateCourseBody,
    UpdateCourseBody,
)
from app.services.courses import (
    create_new_course,
    delete_course_by_id,
    get_all_courses,
    get_course_by_id,
    link_course_to_department,
    update_course_by_id,
)
from fastapi import APIRouter, Depends
from supabase import Client

router = APIRouter(
    prefix="/courses", tags=["courses"], dependencies=[Depends(get_current_user)]
)


@router.get("")
def list_courses(
    university_id: UUID, db: Annotated[Client, Depends(get_supabase_client)]
) -> ApiResponse[list[Course]]:
    courses = get_all_courses(university_id, db)
    return ApiResponse(
        success=True, data=courses, message="Courses fetched successfully"
    )


@router.get("{course_id}")
def get_course(
    course_id: UUID, db: Annotated[Client, Depends(get_supabase_client)]
) -> ApiResponse[Course]:
    course = get_course_by_id(course_id, db)
    return ApiResponse(success=True, data=course, message="Course fetched successfully")


@router.post("")
def create_course(
    course_data: CreateCourseBody, db: Annotated[Client, Depends(get_supabase_client)]
) -> ApiResponse[Course]:
    new_course = create_new_course(course_data, db)
    return ApiResponse(
        success=True, data=new_course, message="Course created successfully"
    )


@router.patch("/{course_id}")
def update_course(
    course_id: UUID,
    course_data: UpdateCourseBody,
    db: Annotated[Client, Depends(get_supabase_client)],
) -> ApiResponse[Course]:
    updated_course = update_course_by_id(course_id, course_data, db)
    return ApiResponse(
        success=True, data=updated_course, message="Course updated successfully"
    )


@router.delete("/{course_id}")
def delete_course(
    course_id: UUID, db: Annotated[Client, Depends(get_supabase_client)]
) -> ApiResponse[Course]:
    deleted_course = delete_course_by_id(course_id, db)
    return ApiResponse(
        success=True, data=deleted_course, message="Course deleted successfully"
    )


@router.post("/providedBy")
def provided_by_course(
    data: CourseDataLink, db: Annotated[Client, Depends(get_supabase_client)]
) -> ApiResponse[CourseWithDepartment]:
    result = link_course_to_department(data, db)
    return ApiResponse(
        success=True, data=result, message="Course linked to department successfully"
    )
