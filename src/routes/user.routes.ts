import { Router } from "express";
import { createUser, getUserByEmail, checkIfUserExists, validateUserPassword} from "../controllers/user.controller";

const router = Router();

// Posts
router.post("/", createUser);
router.post("/checkUser", checkIfUserExists);
router.post("/validatePassword", validateUserPassword);

// Gets
router.get("/:email", getUserByEmail);

export default router;