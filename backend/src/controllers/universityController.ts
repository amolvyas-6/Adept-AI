import type { RequestHandler } from "express";
import { ApiError } from "../types/apiError.types.js";
import { supabase } from "../utils/dbClient.js";

export const getAllUniversities: RequestHandler = async (req, res, next) => {
  const query = supabase
    .from("universities")
    .select("*")
    .order("name", { ascending: true });
  const { data, error } = await query;

  if (error) {
    throw new ApiError(500, error.message);
  }
  return res.status(200).json({
    success: true,
    data,
    message: "Universities retrieved successfully",
  });
};

export const getUniversityById: RequestHandler<{ id: string }> = async (
  req,
  res,
  next
) => {
  const { id } = req.params;
  const query = supabase.from("universities").select("*").eq("id", id).single();
  const { data, error } = await query;

  if (error) {
    throw new ApiError(500, error.message);
  }
  return res.status(200).json({
    success: true,
    data,
    message: "University retrieved successfully",
  });
};

export const addUniversity: RequestHandler = async (req, res, next) => {
  const { name } = req.body;
  const query = supabase.from("universities").insert([{ name }]);
  const { data, error } = await query;

  if (error) {
    throw new ApiError(500, error.message);
  }
  return res.status(201).json({
    success: true,
    data,
    message: "University added successfully",
  });
};

export const updateUniversity: RequestHandler<{ id: string }> = async (
  req,
  res,
  next
) => {
  const { id } = req.params;
  const { name } = req.body;
  const updates: { name?: string } = {};
  if (name) updates.name = name;
  const query = supabase.from("universities").update(updates).eq("id", id);
  const { data, error } = await query;
  if (error) {
    throw new ApiError(500, error.message);
  }
  return res
    .status(200)
    .json({ success: true, data, message: "University updated successfully" });
};

export const deleteUniversity: RequestHandler<{ id: string }> = async (
  req,
  res,
  next
) => {
  const { id } = req.params;
  const query = supabase.from("universities").delete().eq("id", id);
  const { data, error } = await query;

  if (error) {
    throw new ApiError(500, error.message);
  }
  return res
    .status(200)
    .json({ success: true, data, message: "University deleted successfully" });
};
