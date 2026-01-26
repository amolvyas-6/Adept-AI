import type { RequestHandler } from "express";
import { supabase } from "../utils/dbClient.js";
import { ApiError } from "../types/apiError.types.js";

export const registerUser: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  const {
    data: { user },
    error,
  } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    throw new ApiError(401, error.message);
  }
  if (!user) {
    throw new ApiError(500, "User registration failed");
  }

  const userId: string = user.id;
  const query = supabase.from("profiles").insert([{ user_id: userId }]);
  const { error: profileError } = await query;

  if (profileError) {
    throw new ApiError(500, profileError.message);
  }

  return res
    .status(200)
    .json({ success: true, message: "Registration successful" });
};

export const deleteUser: RequestHandler<{ id: string }> = async (req, res) => {
  const id: string = req.params.id;
  const { error } = await supabase.auth.admin.deleteUser(id);

  if (error) {
    throw new ApiError(500, error.message);
  }
  return res
    .status(200)
    .json({ success: true, message: "User deleted successfully" });
};
