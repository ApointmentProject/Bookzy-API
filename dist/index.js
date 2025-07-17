"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const user_routes_1 = __importDefault(require("./src/routes/user.routes"));
const business_routes_1 = __importDefault(require("./src/routes/business.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 8000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("Welcome to the Bookzy API");
});
app.use("/api/users", user_routes_1.default);
app.use("/api/businesses", business_routes_1.default);
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
