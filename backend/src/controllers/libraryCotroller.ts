import type { RequestHandler } from "express";
import { supabase } from "../utils/dbClient.js";
import { ApiError } from "../types/apiError.types.js";

export const getLibrary: RequestHandler = async (req, res) => {
  const userId = req.user?.id;
  const query = supabase
    .from("library")
    .select(
      "*, documents(title, unit, id, profiles(full_name), courses(code, name))"
    )
    .eq("user_id", userId);
  const { data, error } = await query;
  if (error) {
    throw new ApiError(500, error.message);
  }

  const flattenedData = data?.map((item) => {
    return {
      id: item.id,
      saved_at: item.created_at,
      document_id: item.documents.id,
      title: item.documents.title,
      unit: item.documents.unit,
      uploader: item.documents.profiles?.full_name,
      course_code: item.documents.courses.code,
      course_name: item.documents.courses.name,
    };
  });

  return res.status(200).json({
    success: true,
    data: flattenedData,
    message: "Library fetched successfully",
  });
};

export const addToLibrary: RequestHandler = async (req, res) => {
  const userId = req.user?.id;
  const { documentId } = req.body;
  const query = supabase
    .from("library")
    .insert([
      {
        user_id: userId,
        document_id: documentId,
      },
    ])
    .select()
    .single();

  const { data, error } = await query;
  if (error) {
    throw new ApiError(500, error.message);
  }

  return res.status(200).json({
    success: true,
    data: data,
    message: "Document added to library successfully",
  });
};

export const removeFromLibrary: RequestHandler<{ docId: string }> = async (
  req,
  res
) => {
  const userId = req.user?.id;
  const documentId = req.params.docId;

  const query = supabase
    .from("library")
    .delete()
    .eq("document_id", documentId)
    .eq("user_id", userId)
    .select()
    .single();

  const { data, error } = await query;
  if (error) {
    throw new ApiError(500, error.message);
  }

  return res.status(200).json({
    success: true,
    data: data,
    message: "Document removed from library successfully",
  });
};
