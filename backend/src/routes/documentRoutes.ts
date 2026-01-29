import { Router } from "express";
import {
  uploadDocument,
  deleteDocument,
  updateDocument,
  getDocument,
} from "../controllers/documentController.js";
import { upload } from "../middlewares/fileUpload.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(asyncHandler(authMiddleware));
router.post("/", upload.single("document"), asyncHandler(uploadDocument));
router.delete("/:id", asyncHandler(deleteDocument));
router.patch("/:id", asyncHandler(updateDocument));
router.get("/:id", asyncHandler(getDocument));

export default router;
