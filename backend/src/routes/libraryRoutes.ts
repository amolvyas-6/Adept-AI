import { Router } from "express";
import {
  addToLibrary,
  getLibrary,
  removeFromLibrary,
} from "../controllers/libraryCotroller.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(asyncHandler(authMiddleware));

router.get("/", asyncHandler(getLibrary));
router.post("/", asyncHandler(addToLibrary));
router.delete("/:docId", asyncHandler(removeFromLibrary));

export default router;
