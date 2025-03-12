"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const test_1 = require("../controllers/test");
const router = (0, express_1.Router)();
router.get("/", test_1.getTestData);
exports.default = router;
