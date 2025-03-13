import { Router } from "express";
import { createUser, getUserById } from "../controllers/user.controller";

const router = Router();

// Posts
router.post("/", createUser);

// Gets
router.get("/:id", getUserById);

export default router;