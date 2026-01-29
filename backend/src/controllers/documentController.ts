import type { RequestHandler } from "express";
import { deleteObject, putObject } from "../utils/s3Client.js";
import { ApiError } from "../types/apiError.types.js";
import { supabase } from "../utils/dbClient.js";

export const uploadDocument: RequestHandler = async (req, res) => {
  const file = req.file;
  if (!file) {
    throw new ApiError(400, "No file uploaded");
  }
  const userId = req.user?.id;
  const { title, unit, courseId } = req.body;

  const query = supabase
    .from("documents")
    .insert([
      {
        title: title || file.originalname,
        user_id: userId,
        unit: unit || null,
        course_id: courseId,
      },
    ])
    .select()
    .single();

  const { data, error } = await query;
  if (error) {
    throw new ApiError(500, error.message);
  }

  const key = `documents/${data.id}.pdf`;
  await putObject(key, file.buffer, file.mimetype);

  return res.json({
    success: true,
    message: "Uploaded document successfully",
    data: data,
  });
};

export const deleteDocument: RequestHandler<{ id: string }> = async (
  req,
  res
) => {
  const id = req.params.id;
  const query = supabase
    .from("documents")
    .delete()
    .eq("id", id)
    .select()
    .single();

  const { data, error } = await query;
  if (error) {
    throw new ApiError(500, error.message);
  }

  const key = `documents/${data.id}.pdf`;
  await deleteObject(key);
  return res.json({
    status: true,
    message: "Document deleted successfully",
  });
};

export const updateDocument: RequestHandler<{ id: string }> = async (
  req,
  res
) => {
  const id = req.params.id;
  const { title, unit, courseId } = req.body;

  if (!title && !unit && !courseId) {
    throw new ApiError(400, "No fields to update");
  }
  const updates: { title?: string; unit?: number; course_id?: string } = {};
  if (title) updates.title = title;
  if (unit) updates.unit = Number(unit);
  if (courseId) updates.course_id = courseId;

  const query = supabase
    .from("documents")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  const { data, error } = await query;
  if (error) {
    throw new ApiError(500, error.message);
  }

  return res.json({
    success: true,
    message: "Updated document successfully",
    data: data,
  });
};

export const getDocument: RequestHandler<{ id: string }> = async (req, res) => {
  const id = req.params.id;

  const query = supabase
    .from("documents")
    .select("*, profiles(full_name), courses(name, code)")
    .eq("id", id)
    .single();
  const { data, error } = await query;
  if (error) {
    throw new ApiError(404, error.message);
  }
  res.status(200).json({
    success: true,
    data: data,
    message: "Document fetched successfully",
  });
};
