import { supabase } from "../utils/dbClient.js";
import { ApiError } from "../types/apiError.types.js";

import type { RequestHandler } from "express";

const getProfile: RequestHandler<{ id: string }> = async (req, res) => {
  const id: string = req.params.id;

  if (req.user.id !== id) {
    throw new ApiError(403, "Forbidden: You can only access your own profile");
  }

  const query = supabase
    .from("profiles")
    .select("*")
    .eq("user_id", id)
    .single();

  const { data, error } = await query;
  if (error) {
    throw new ApiError(404, error.message);
  }

  return res.status(200).json({
    success: true,
    data: data,
    message: "Profile fetched successfully",
  });
};

const updateProfile: RequestHandler<{ id: string }> = async (req, res) => {
  const id: string = req.params.id;

  if (req.user.id !== id) {
    throw new ApiError(403, "Forbidden: You can only update your own profile");
  }

  const { deptId, fullName, universityId } = req.body;
  if (!deptId && !fullName && !universityId) {
    throw new ApiError(400, "At least one field must be provided for update");
  }

  const updates: {
    dept_id?: string;
    full_name?: string;
    university_id?: string;
  } = {};
  if (deptId) updates.dept_id = deptId;
  if (fullName) updates.full_name = fullName;
  if (universityId) updates.university_id = universityId;

  const query = supabase
    .from("profiles")
    .update(updates)
    .eq("user_id", id)
    .select("*")
    .single();

  const { data, error } = await query;
  if (error) {
    throw new ApiError(500, error.message);
  }

  return res.status(200).json({
    success: true,
    data: data,
    message: "Profile updated successfully",
  });
};

export { getProfile, updateProfile };
