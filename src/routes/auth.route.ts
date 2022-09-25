import Express from "express";
import { signUp } from "../controllers/auth.controller";

const authRoutes = Express.Router();

authRoutes.route("/register").post(signUp);

export default authRoutes;
