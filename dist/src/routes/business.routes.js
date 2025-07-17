"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const business_controller_1 = require("../controllers/business.controller");
const router = (0, express_1.Router)();
// Rutas públicas
router.get("/categories", business_controller_1.getBusinessCategories);
router.get("/slug/:slug", business_controller_1.getBusinessBySlug);
// Rutas protegidas (deberías agregar middleware de autenticación)
router.post("/", business_controller_1.createBusiness);
router.get("/user/:userId", business_controller_1.getUserBusinesses);
router.put("/:businessId", business_controller_1.updateBusiness);
exports.default = router;
