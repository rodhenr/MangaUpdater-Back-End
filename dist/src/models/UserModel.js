"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({});
const userModel = (0, mongoose_1.model)("user", userSchema);
exports.userModel = userModel;
