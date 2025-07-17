"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const router = (0, express_1.Router)();
// Posts
router.post("/", user_controller_1.createUser);
router.post("/checkUser", user_controller_1.checkIfUserExists);
router.post("/validatePassword", user_controller_1.validateUserPassword);
// Gets
router.get("/:email", user_controller_1.getUserByEmail);
router.get("/delete-user-data/:user_id", user_controller_1.deleteUserData);
router.put("/link-firebase", user_controller_1.linkFirebaseUid);
exports.default = router;
