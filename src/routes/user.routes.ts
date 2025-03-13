import { Router } from "express";
import { createUser, getUserById, checkIfUserExists} from "../controllers/user.controller";

const router = Router();

// Posts
router.post("/", createUser);

// Gets
router.get("/:id", getUserById);
router.get("/checkUser/:email", checkIfUserExists);

export default router;