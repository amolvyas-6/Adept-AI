import { Router } from "express";
import { getAllDocuments, createDocument, deleteDocument } from "../controllers/documentController.js";

const router = Router();

router.get("/", getAllDocuments);
router.post("/", createDocument);
router.delete("/:id", deleteDocument);

export default router;
