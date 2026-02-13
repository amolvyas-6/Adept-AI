from uuid import UUID

from app.dependencies.authDependency import get_current_user
from app.dependencies.supabaseClient import get_supabase_client
from app.schemas.courses import CourseCreate, CourseDataLink, CourseUpdate
from app.services.courses import (
    createNewCourse,
    deleteCourseById,
    getAllCourses,
    getCourseById,
    linkCourseToDepartment,
    updateCourseById,
)
from fastapi import APIRouter, Depends

router = APIRouter(
    prefix="/courses", tags=["courses"], dependencies=[Depends(get_current_user)]
)


@router.get("/")
def listCourses(universityId: UUID, db=Depends(get_supabase_client)):
    courses = getAllCourses(universityId, db)
    return {
        "success": True,
        "data": courses,
        "message": "Courses fetched successfully",
    }


@router.get("/{courseId}")
def getCourse(courseId: UUID, db=Depends(get_supabase_client)):
    course = getCourseById(courseId, db)
    return {
        "success": True,
        "data": course,
        "message": "Course fetched successfully",
    }


@router.post("/")
def createCourse(courseData: CourseCreate, db=Depends(get_supabase_client)):
    newCourse = createNewCourse(courseData, db)
    return {
        "success": True,
        "data": newCourse,
        "message": "Course created successfully",
    }


@router.patch("/{courseId}")
def updateCourse(
    courseId: UUID, courseData: CourseUpdate, db=Depends(get_supabase_client)
):
    updatedCourse = updateCourseById(courseId, courseData, db)
    return {
        "success": True,
        "data": updatedCourse,
        "message": "Course updated successfully",
    }


@router.delete("/{courseId}")
def deleteCourse(courseId: UUID, db=Depends(get_supabase_client)):
    deletedCourse = deleteCourseById(courseId, db)
    return {
        "success": True,
        "data": deletedCourse,
        "message": "Course deleted successfully",
    }


@router.post("/providedBy")
def providedByCourse(data: CourseDataLink, db=Depends(get_supabase_client)):
    result = linkCourseToDepartment(data, db)
    return {
        "success": True,
        "data": result,
        "message": "Course linked to Department successfully",
    }
