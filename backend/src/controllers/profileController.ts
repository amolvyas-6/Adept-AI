import { supabase } from "../utils/dbClient.js";
import { ApiError } from "../types/apiError.types.js";

import type { RequestHandler } from "express";

const getProfile: RequestHandler<{ id: string }> = async (req, res) => {
  const id: string = req.params.id;

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
  const { avatar } = req.body;
  if (!avatar) {
    throw new ApiError(400, "At least one field must be provided for update");
  }

  const updates: { avatar?: string } = {};
  if (avatar) updates.avatar = avatar;

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
