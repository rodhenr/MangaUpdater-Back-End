import Express from "express";
import { login, register } from "../controllers/auth.controller";

const authRoutes = Express.Router();

authRoutes.route("/auth/login").post(login);
authRoutes.route("/auth/register").post(register);

export default authRoutes;
