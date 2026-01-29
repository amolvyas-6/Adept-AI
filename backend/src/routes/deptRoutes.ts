import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/deptController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(asyncHandler(authMiddleware));

router.get("/", asyncHandler(getAllDepartments));
router.get("/:deptId", asyncHandler(getDepartmentById));
router.post("/", asyncHandler(createDepartment));
router.patch("/:deptId", asyncHandler(updateDepartment));
router.delete("/:deptId", asyncHandler(deleteDepartment));

export default router;
