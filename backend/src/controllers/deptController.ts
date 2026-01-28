import type { RequestHandler } from "express";
import { supabase } from "../utils/dbClient.js";
import { ApiError } from "../types/apiError.types.js";

export const getAllDepartments: RequestHandler = async (req, res) => {
  const query = supabase.from("departments").select("*");
  const { data, error } = await query;
  if (error) {
    throw new ApiError(500, error.message);
  }
  return res.status(200).json({
    success: true,
    data,
    message: "Departments fetched successfully",
  });
};

export const getDepartmentById: RequestHandler<{ deptId: string }> = async (
  req,
  res
) => {
  const deptId = req.params.deptId;
  const query = supabase
    .from("departments")
    .select("*")
    .eq("id", deptId)
    .single();

  const { data, error } = await query;
  if (error) {
    throw new ApiError(500, error.message);
  }
  return res.status(200).json({
    success: true,
    data,
    message: "Department fetched successfully",
  });
};

export const createDepartment: RequestHandler = async (req, res) => {
  const { name, abbreviation } = req.body;
  const createDeptQuery = supabase
    .from("departments")
    .insert([{ name, abbreviation }])
    .select()
    .single();

  const { data, error } = await createDeptQuery;
  if (error) {
    throw new ApiError(500, error.message);
  }
  return res.status(201).json({
    success: true,
    data,
    message: "Department created successfully",
  });
};

export const updateDepartment: RequestHandler<{ deptId: string }> = async (
  req,
  res
) => {
  const deptId = req.params.deptId;
  const { name, abbreviation } = req.body;

  const updates: { name?: string; abbreviation?: string } = {};
  if (name) updates.name = name;
  if (abbreviation) updates.abbreviation = abbreviation;
  const query = supabase
    .from("departments")
    .update(updates)
    .eq("id", deptId)
    .select()
    .single();

  const { data, error } = await query;
  if (error) {
    throw new ApiError(500, error.message);
  }
  return res.status(200).json({
    success: true,
    data,
    message: "Department updated successfully",
  });
};

export const deleteDepartment: RequestHandler<{ deptId: string }> = async (
  req,
  res
) => {
  const deptId = req.params.deptId;
  const query = supabase
    .from("departments")
    .delete()
    .eq("id", deptId)
    .select()
    .single();

  const { data, error } = await query;
  if (error) {
    throw new ApiError(500, error.message);
  }
  res.status(200).json({
    success: true,
    data,
    message: "Department deleted successfully",
  });
};
