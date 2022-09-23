"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT;
app.use((0, cors_1.default)({ credentials: true, origin: true }));
//mongoose connection
mongoose_1.default.connect("mongodb://localhost:27017/mangaupdaterDB", () => {
    console.log("connected to database");
});
app.listen(port, () => {
    console.log(`Server ON! Listening port ${port}...`);
});
