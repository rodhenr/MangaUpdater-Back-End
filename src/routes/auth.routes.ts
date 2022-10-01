import Express from "express";
import { login, register } from "../controllers/auth.controller";
import {
  verifyLogin,
  verifyRegister,
} from "../middlewares/authVerify.middleware";

const authRoutes = Express.Router();

authRoutes.route("/auth/login").post(verifyLogin, login);
authRoutes.route("/auth/register").post(verifyRegister, register);

export default authRoutes;
