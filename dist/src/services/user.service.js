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
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptUser = exports.encryptUser = void 0;
const cypher_1 = require("../utils/cypher");
const encryptUser = (user) => __awaiter(void 0, void 0, void 0, function* () {
    return Object.assign(Object.assign({}, user), { email: (0, cypher_1.encryptData)(user.email), phone_number: (0, cypher_1.encryptData)(user.phone_number), password_hash: yield (0, cypher_1.hashPassword)(user.password_hash) });
});
exports.encryptUser = encryptUser;
const decryptUser = (user) => {
    return Object.assign(Object.assign({}, user), { email: (0, cypher_1.decryptData)(user.email), phone_number: (0, cypher_1.decryptData)(user.phone_number) });
};
exports.decryptUser = decryptUser;
