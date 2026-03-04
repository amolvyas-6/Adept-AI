from typing import Annotated
from uuid import UUID

from app.dependencies.authDependency import get_current_user
from app.dependencies.supabaseClient import get_supabase_client
from app.schemas.core import ApiResponse
from app.schemas.courses import (
    Course,
    CourseDataLink,
    CourseWithDepartment,
    CreateCourseBody,
    UpdateCourseBody,
)
from app.services.courses import (
    createNewCourse,
    deleteCourseById,
    getAllCourses,
    getCourseById,
    linkCourseToDepartment,
    updateCourseById,
)
from fastapi import APIRouter, Depends
from supabase import Client

router = APIRouter(
    prefix="/courses", tags=["courses"], dependencies=[Depends(get_current_user)]
)


@router.get("/")
def listCourses(
    universityId: UUID, db: Annotated[Client, Depends(get_supabase_client)]
) -> ApiResponse[list[Course]]:
    courses = getAllCourses(universityId, db)
    return ApiResponse(
        success=True, data=courses, message="Courses fetched successfully"
    )


@router.get("/{courseId}")
def getCourse(
    courseId: UUID, db: Annotated[Client, Depends(get_supabase_client)]
) -> ApiResponse[Course]:
    course = getCourseById(courseId, db)
    return ApiResponse(success=True, data=course, message="Course fetched successfully")


@router.post("/")
def createCourse(
    courseData: CreateCourseBody, db: Annotated[Client, Depends(get_supabase_client)]
) -> ApiResponse[Course]:
    newCourse = createNewCourse(courseData, db)
    return ApiResponse(
        success=True, data=newCourse, message="Course created successfully"
    )


@router.patch("/{courseId}")
def updateCourse(
    courseId: UUID,
    courseData: UpdateCourseBody,
    db: Annotated[Client, Depends(get_supabase_client)],
) -> ApiResponse[Course]:
    updatedCourse = updateCourseById(courseId, courseData, db)
    return ApiResponse(
        success=True, data=updatedCourse, message="Course updated successfully"
    )


@router.delete("/{courseId}")
def deleteCourse(
    courseId: UUID, db: Annotated[Client, Depends(get_supabase_client)]
) -> ApiResponse[Course]:
    deletedCourse = deleteCourseById(courseId, db)
    return ApiResponse(
        success=True, data=deletedCourse, message="Course deleted successfully"
    )


@router.post("/providedBy")
def providedByCourse(
    data: CourseDataLink, db: Annotated[Client, Depends(get_supabase_client)]
) -> ApiResponse[CourseWithDepartment]:
    result = linkCourseToDepartment(data, db)
    return ApiResponse(
        success=True, data=result, message="Course linked to department successfully"
    )
