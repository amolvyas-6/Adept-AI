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

router.get("/", asyncHandler(getAllDepartments));
router.get("/:deptId", asyncHandler(getDepartmentById));
router.post("/", asyncHandler(authMiddleware), asyncHandler(createDepartment));
router.patch(
  "/:deptId",
  asyncHandler(authMiddleware),
  asyncHandler(updateDepartment)
);
router.delete(
  "/:deptId",
  asyncHandler(authMiddleware),
  asyncHandler(deleteDepartment)
);

export default router;
