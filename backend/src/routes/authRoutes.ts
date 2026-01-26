import { Router } from "express";
import { registerUser, deleteUser } from "../controllers/authController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const authRoutes = Router();

authRoutes.post("/register", asyncHandler(registerUser));
authRoutes.delete("/:id", asyncHandler(deleteUser));

export default authRoutes;
