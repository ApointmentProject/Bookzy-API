import { Router } from "express";
import { getTestData, testCypher } from "../controllers/test.controller";

const router = Router();

router.get("/", getTestData);
router.get("/cypher", testCypher);

export default router;
