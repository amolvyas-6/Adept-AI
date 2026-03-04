from uuid import UUID

from app.schemas.courses import (
    Course,
    CourseDataLink,
    CourseWithDepartment,
    CreateCourseBody,
    UpdateCourseBody,
)
from fastapi import HTTPException
from supabase import Client


def getAllCourses(universityId: UUID, db: Client) -> list[Course]:
    query = db.table("courses").select("*").eq("university_id", str(universityId))
    response = query.execute()
    return [Course.model_validate(course) for course in response.data]


def getCourseById(courseId: UUID, db: Client) -> Course:
    query = db.table("courses").select("*").eq("id", str(courseId))
    response = query.execute()
    if len(response.data) == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    return Course.model_validate(response.data[0])


def createNewCourse(course: CreateCourseBody, db: Client) -> Course:
    query = db.table("courses").insert(
        {
            "name": course.name,
            "code": course.code,
            "university_id": str(course.university_id),
        }
    )
    response = query.execute()
    if len(response.data) == 0:
        raise HTTPException(status_code=500, detail="Failed to create course")
    return Course.model_validate(response.data[0])


def updateCourseById(courseId: UUID, course: UpdateCourseBody, db: Client) -> Course:
    update_data = {}
    if course.name is not None:
        update_data["name"] = course.name
    if course.code is not None:
        update_data["code"] = course.code
    if course.university_id is not None:
        update_data["university_id"] = str(course.university_id)

    if len(update_data) == 0:
        raise HTTPException(status_code=400, detail="No fields to update provided")

    query = db.table("courses").update(update_data).eq("id", str(courseId))
    response = query.execute()
    if len(response.data) == 0:
        raise HTTPException(status_code=500, detail="Failed to update course")
    return Course.model_validate(response.data[0])


def deleteCourseById(courseId: UUID, db: Client) -> Course:
    query = db.table("courses").delete().eq("id", str(courseId))
    response = query.execute()
    if len(response.data) == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    return Course.model_validate(response.data[0])


def linkCourseToDepartment(data: CourseDataLink, db: Client) -> CourseWithDepartment:
    query = db.table("provided_by").insert(
        {
            "course_id": str(data.course_id),
            "dept_id": str(data.department_id),
        }
    )
    response = query.execute()
    if len(response.data) == 0:
        raise HTTPException(
            status_code=500, detail="Failed to link course to department"
        )
    return CourseWithDepartment.model_validate(response.data[0])
