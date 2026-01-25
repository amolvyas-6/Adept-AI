import { supabase } from "../dbClient.js";
import { ApiError } from "../types/apiError.types.js";

import type { RequestHandler } from "express";

const getAllUsers: RequestHandler = async (req, res) => {
  const { limit = 10, page = 1, sort = "asc", orderBy = "id" } = req.query;

  const query = supabase
    .from("users")
    .select("id, username, email, created_at")
    .range((Number(page) - 1) * Number(limit), Number(page) * Number(limit) - 1)
    .order(orderBy as string, { ascending: sort === "asc" });

  const { data, error } = await query;
  if (error) {
    throw new ApiError(500, "Failed to fetch users");
  }

  return res.status(200).json({
    success: true,
    data: data,
    message: "Users fetched successfully",
  });
};

const getSingleUser: RequestHandler<{ id: string }> = async (req, res) => {
  const id: number = Number(req.params.id);

  const query = supabase
    .from("users")
    .select("id, username, email, created_at")
    .eq("id", id)
    .single();

  const { data, error } = await query;
  if (error) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json({
    success: true,
    data: data,
    message: "User fetched successfully",
  });
};

const createUser: RequestHandler = async (req, res) => {
  const { username, email, password } = req.body;

  const query = supabase
    .from("users")
    .insert([{ username, email, password }])
    .select()
    .single();

  const { data, error } = await query;
  if (error) {
    throw new ApiError(500, "Failed to create user");
  }

  return res.status(201).json({
    success: true,
    data: data,
    message: "User created successfully",
  });
};

const updateUser: RequestHandler<{ id: string }> = async (req, res) => {
  const id: number = Number(req.params.id);
  const { username, email } = req.body;
  if (!username && !email) {
    throw new ApiError(
      400,
      "At least one field (username, email, password) must be provided for update"
    );
  }

  const updates: { username?: string; email?: string } = {};
  if (username) updates.username = username;
  if (email) updates.email = email;

  const query = supabase
    .from("users")
    .update(updates)
    .eq("id", id)
    .select("id, username, email, created_at")
    .single();

  const { data, error } = await query;
  if (!data) {
    throw new ApiError(404, "User not found");
  }
  if (error) {
    throw new ApiError(500, "Failed to update user");
  }

  return res.status(200).json({
    success: true,
    data: data,
    message: "User updated successfully",
  });
};

const deleteUser: RequestHandler<{ id: string }> = async (req, res) => {
  const id: number = Number(req.params.id);

  const query = supabase.from("users").delete().eq("id", id).select().single();

  const { data, error } = await query;
  if (!data) {
    throw new ApiError(404, "User not found");
  }
  if (error) {
    throw new ApiError(500, "Failed to delete user");
  }

  return res.status(200).json({
    success: true,
    data: data,
    message: "User deleted successfully",
  });
};

export { getAllUsers, getSingleUser, createUser, updateUser, deleteUser };
