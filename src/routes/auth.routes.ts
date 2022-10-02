import Express from "express";
import { login, register, refreshToken } from "../controllers/auth.controller";
import {
  verifyLogin,
  verifyRegister,
} from "../middlewares/authVerify.middleware";

const authRoutes = Express.Router();

authRoutes.route("/auth/login").post(verifyLogin, login);
authRoutes.route("/auth/register").post(verifyRegister, register);
authRoutes.route("/auth/refresh").get(refreshToken);

export default authRoutes;
