import { Router } from "express";
import { getAllUsers, createUser, updateUser, deleteUser } from "../controllers/userController.js";

const router = Router();

router.get("/", getAllUsers);
router.post("/", createUser);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
