import Express from "express";
import { uploadAvatar } from "../controllers/user.controller";
import { upload, storage } from "../middlewares/avatar.middleware";

const userRoutes = Express.Router();

userRoutes.route("/api/user/avatar").post(upload, uploadAvatar);

export default userRoutes;
