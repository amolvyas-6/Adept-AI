import multer from "multer";
import { ApiError } from "../types/apiError.types.js";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new ApiError(400, "Only PDF files are allowed"));
    }
  },
});
