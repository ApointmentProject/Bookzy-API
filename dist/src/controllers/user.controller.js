"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkFirebaseUid = exports.deleteUserData = exports.validateUserPassword = exports.checkIfUserExists = exports.getUserByEmail = exports.createUser = void 0;
const database_1 = __importDefault(require("../config/database"));
const user_service_1 = require("../services/user.service");
const cypher_1 = require("../utils/cypher");
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.body;
        if (!user.first_name || !user.last_name || !user.email || !user.phone_number ||
            !user.birthday || !user.id_number || !user.gender || !user.password_hash) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }
        const encryptedUser = yield (0, user_service_1.encryptUser)(user);
        yield database_1.default.none("CALL create_user($1, $2, $3, $4, $5, $6, $7, $8)", [
            encryptedUser.first_name,
            encryptedUser.last_name,
            encryptedUser.email,
            encryptedUser.phone_number,
            encryptedUser.birthday,
            encryptedUser.id_number,
            encryptedUser.gender,
            encryptedUser.password_hash
        ]);
        res.status(201).json({ message: "User created successfully" });
    }
    catch (error) {
        console.error("Database Error:", error);
        // Error de clave única (usuario duplicado por email)
        if (error.code === "23505" && error.constraint === "user_account_email_key") {
            res.status(409).json({
                success: false,
                error: "Ya existe un usuario registrado con este correo electrónico",
            });
            return;
        }
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.createUser = createUser;
// This MUST be changed to getUserByEmail
const getUserByEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.params.email;
        if (!email) {
            res.status(400).json({
                success: false,
                error: "Email es requerido"
            });
            return;
        }
        const encryptedEmail = (0, cypher_1.encryptData)(email);
        const user = yield database_1.default.oneOrNone("SELECT * FROM get_user_by_email($1)", [encryptedEmail]);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
            return;
        }
        const decryptedUser = (0, user_service_1.decryptUser)(user);
        res.status(200).json({
            success: true,
            data: {
                uid: decryptedUser.uid || '',
                profilePic: decryptedUser.profile_pic || '',
                email: email,
                firstName: decryptedUser.first_name,
                lastName: decryptedUser.last_name,
            }
        });
    }
    catch (error) {
        console.error("Error en getUserByEmail:", error);
        res.status(500).json({
            success: false,
            error: "Error interno del servidor"
        });
    }
});
exports.getUserByEmail = getUserByEmail;
const checkIfUserExists = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ error: "El correo es obligatorio" });
            return;
        }
        const encryptedEmail = (0, cypher_1.encryptData)(email);
        const userExistsResult = yield database_1.default.oneOrNone("SELECT check_if_user_exists($1) AS check_if_user_exists", [encryptedEmail]);
        if (userExistsResult === null) {
            res.status(500).json({ error: "No se pudo verificar el usuario" });
            return;
        }
        res.status(200).json({ userExists: userExistsResult.check_if_user_exists });
    }
    catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});
exports.checkIfUserExists = checkIfUserExists;
const validateUserPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: "Correo y contraseña son obligatorios" });
            return;
        }
        const encryptedEmail = (0, cypher_1.encryptData)(email);
        const passwordStoraged = yield database_1.default.oneOrNone("SELECT * FROM get_user_password($1)", [encryptedEmail]);
        if (!(passwordStoraged === null || passwordStoraged === void 0 ? void 0 : passwordStoraged.get_user_password)) {
            res.status(404).json({ error: "El correo ingresado no está registrado" });
            return;
        }
        const passwordMatch = yield (0, cypher_1.comparePassword)(password, passwordStoraged.get_user_password);
        if (!passwordMatch) {
            res.status(401).json({ error: "La contraseña es incorrecta" });
            return;
        }
        res.json({ passwordMatch: true });
    }
    catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});
exports.validateUserPassword = validateUserPassword;
const deleteUserData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Se extrae el user_id de los parámetros de la ruta y se convierte a número.
        const userId = Number(req.params.user_id);
        if (!userId || isNaN(userId)) {
            res.status(400).json({ error: "Invalid user id" });
            return;
        }
        // Se intenta eliminar el usuario y se devuelve el usuario eliminado para confirmar la acción.
        const deletedUser = yield database_1.default.oneOrNone("DELETE FROM user_account WHERE id = $1 RETURNING *", [userId]);
        if (!deletedUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json({
            status: "success",
            confirmation: `La solicitud de eliminación para el usuario ${userId} se ha procesado correctamente.`,
            deletedUser,
        });
    }
    catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.deleteUserData = deleteUserData;
const linkFirebaseUid = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, uid, profilePic } = req.body;
        if (!email || !uid) {
            res.status(400).json({
                success: false,
                error: "Email y UID son obligatorios"
            });
            return;
        }
        const encryptedEmail = (0, cypher_1.encryptData)(email);
        // Verificar si el usuario existe
        const userExists = yield database_1.default.oneOrNone("SELECT id, uid FROM user_account WHERE email = $1", [encryptedEmail]);
        if (!userExists) {
            res.status(404).json({
                success: false,
                error: "Usuario no encontrado"
            });
            return;
        }
        // Verificar si el UID ya está en uso por otro usuario
        const uidExists = yield database_1.default.oneOrNone("SELECT id FROM user_account WHERE uid = $1 AND email != $2", [uid, encryptedEmail]);
        if (uidExists) {
            res.status(409).json({
                success: false,
                error: "Este UID de Firebase ya está vinculado a otro usuario"
            });
            return;
        }
        // Actualizar el usuario con el UID de Firebase
        const updateResult = yield database_1.default.result("UPDATE user_account SET uid = $1, profile_pic = $2 WHERE email = $3", [uid, profilePic || null, encryptedEmail]);
        if (updateResult.rowCount === 0) {
            res.status(500).json({
                success: false,
                error: "No se pudo actualizar el usuario"
            });
            return;
        }
        // Obtener los datos actualizados
        const updatedUser = yield database_1.default.oneOrNone("SELECT uid, profile_pic, first_name, last_name FROM user_account WHERE email = $1", [encryptedEmail]);
        res.status(200).json({
            success: true,
            message: "Firebase UID vinculado exitosamente",
            data: {
                uid: (updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.uid) || '',
                profilePic: (updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.profile_pic) || '',
                firstName: (updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.first_name) || '',
                lastName: (updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.last_name) || '',
                email: email
            }
        });
    }
    catch (error) {
        console.error("Error al vincular UID:", error);
        res.status(500).json({
            success: false,
            error: "Error interno del servidor"
        });
    }
});
exports.linkFirebaseUid = linkFirebaseUid;
