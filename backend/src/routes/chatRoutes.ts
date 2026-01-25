import { Router } from "express";
import { getAllChats, createChat, updateChat, deleteChat } from "../controllers/chatController.js";

const router = Router();
    
router.get("/", getAllChats);
router.post("/", createChat);
router.patch("/:id", updateChat);
router.delete("/:id", deleteChat);

export default router;
