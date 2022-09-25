import Express from "express";
import { login, register } from "../controllers/auth.controller";

const authRoutes = Express.Router();

authRoutes.route("/register").post(register);
authRoutes.route("/login").get(login);

export default authRoutes;
