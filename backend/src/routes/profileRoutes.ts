import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.patch("/:id", asyncHandler(updateProfile));
router.get("/:id", asyncHandler(getProfile));

export default router;
