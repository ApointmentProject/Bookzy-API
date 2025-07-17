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
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
exports.encryptData = encryptData;
exports.decryptData = decryptData;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const SECRET_KEY = Buffer.from(process.env.SECRET_KEY || "", "hex");
const IV = Buffer.from(process.env.IV || "", "hex");
const ALGORITHM = process.env.ALGORITHM || "";
// Passwords (Hash and Salt algorithms) ------------------------------------------------------
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function* () {
        const saltRounds = 10;
        const salt = yield bcryptjs_1.default.genSalt(saltRounds);
        return yield bcryptjs_1.default.hash(password, salt);
    });
}
// hola123
// 
function comparePassword(password, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcryptjs_1.default.compare(password, hash);
    });
}
// Regular data encryptation ------------------------------------------------------
function encryptData(data) {
    const cipher = crypto_1.default.createCipheriv(ALGORITHM, SECRET_KEY, IV);
    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
}
function decryptData(encryptedData) {
    if (!encryptedData) {
        throw new Error("Invalid encrypted string format");
    }
    const decipher = crypto_1.default.createDecipheriv(ALGORITHM, SECRET_KEY, IV);
    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}
