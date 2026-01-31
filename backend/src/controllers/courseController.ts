import type { RequestHandler } from "express";
import { supabase } from "../utils/dbClient.js";
import { ApiError } from "../types/apiError.types.js";

export const getAllCourses: RequestHandler = async (req, res) => {
  const universityId = req.query.universityId as string | undefined;
  let query = supabase.from("courses").select("*");
  if (universityId) {
    query = query.eq("university_id", universityId);
  }
  const { data, error } = await query;
  if (error) {
    throw new ApiError(500, error.message);
  }
  res.status(200).json({
    success: true,
    data,
    message: "Courses fetched successfully",
  });
};

export const getCourseById: RequestHandler<{ courseId: string }> = async (
  req,
  res
) => {
  const courseId = req.params.courseId;
  const query = supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();

  const { data, error } = await query;
  if (error) {
    throw new ApiError(500, error.message);
  }
  res.status(200).json({
    success: true,
    data,
    message: "Course fetched successfully",
  });
};

export const createCourse: RequestHandler = async (req, res) => {
  const { name, code, universityId } = req.body;
  const createCourseQuery = supabase
    .from("courses")
    .insert([{ name, code, university_id: universityId }])
    .select()
    .single();

  const { data, error } = await createCourseQuery;
  if (error) {
    throw new ApiError(500, error.message);
  }

  res.status(201).json({
    success: true,
    data,
    message: "Course created successfully",
  });
};

export const updateCourse: RequestHandler<{ courseId: string }> = async (
  req,
  res
) => {
  const courseId = req.params.courseId;
  const { name, code, universityId } = req.body;

  const updates: { name?: string; code?: string; university_id?: string } = {};
  if (name) updates.name = name;
  if (code) updates.code = code;
  if (universityId) updates.university_id = universityId;

  const query = supabase
    .from("courses")
    .update(updates)
    .eq("id", courseId)
    .select()
    .single();

  const { data, error } = await query;
  if (error) {
    throw new ApiError(500, error.message);
  }
  res.status(200).json({
    success: true,
    data,
    message: "Course updated successfully",
  });
};

export const deleteCourse: RequestHandler<{ courseId: string }> = async (
  req,
  res
) => {
  const courseId = req.params.courseId;
  const query = supabase.from("courses").delete().eq("id", courseId).select();

  const { data, error } = await query;
  if (error) {
    throw new ApiError(500, error.message);
  }
  res.status(200).json({
    success: true,
    data,
    message: "Course deleted successfully",
  });
};

export const assignCourseToDepartment: RequestHandler = async (req, res) => {
  const { courseId, departmentId } = req.body;

  const query = supabase
    .from("provided_by")
    .insert([{ course_id: courseId, dept_id: departmentId }])
    .select()
    .single();

  const { data, error } = await query;
  if (error) {
    throw new ApiError(500, error.message);
  }
  res.status(200).json({
    success: true,
    data,
    message: "Course assigned to department successfully",
  });
};
