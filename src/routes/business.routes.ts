import { Router } from "express";
import {
  createBusiness,
  getUserBusinesses,
  getBusinessBySlug,
  updateBusiness,
  getBusinessCategories,
} from "../controllers/business.controller";

const router = Router();

// Rutas públicas
router.get("/categories", getBusinessCategories);
router.get("/slug/:slug", getBusinessBySlug);

// Rutas protegidas (deberías agregar middleware de autenticación)
router.post("/", createBusiness);
router.get("/user/:userId", getUserBusinesses);
router.put("/:businessId", updateBusiness);

export default router;