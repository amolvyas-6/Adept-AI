import { Router } from "express";
import {
  getAllUniversities,
  getUniversityById,
  addUniversity,
  updateUniversity,
  deleteUniversity,
} from "../controllers/universityController.js";

const router = Router();

router.get("/", getAllUniversities);
router.get("/:id", getUniversityById);
router.post("/", addUniversity);
router.put("/:id", updateUniversity);
router.delete("/:id", deleteUniversity);

export default router;
