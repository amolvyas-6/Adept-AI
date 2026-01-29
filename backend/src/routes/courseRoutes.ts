import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  assignCourseToDepartment,
} from "../controllers/courseController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(asyncHandler(authMiddleware));

router.get("/", asyncHandler(getAllCourses));
router.get("/:courseId", asyncHandler(getCourseById));
router.post("/", asyncHandler(createCourse));
router.patch("/:courseId", asyncHandler(updateCourse));
router.delete("/:courseId", asyncHandler(deleteCourse));
router.post("/providedBy", asyncHandler(assignCourseToDepartment));

export default router;
