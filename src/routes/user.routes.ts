import { Router } from "express";
import { createUser, getUserByEmail, checkIfUserExists, validateUserPassword, deleteUserData} from "../controllers/user.controller";

const router = Router();

// Posts
router.post("/", createUser);
router.post("/checkUser", checkIfUserExists);
router.post("/validatePassword", validateUserPassword);

// Gets
router.get("/:email", getUserByEmail);
router.get("/delete-user-data/:user_id", deleteUserData);

export default router;