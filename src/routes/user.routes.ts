import Express from "express";
import { getAvatar, uploadAvatar } from "../controllers/user.controller";
import { upload } from "../middlewares/avatar.middleware";
import verifyToken from "../middlewares/verifyJWT.middleware";

const userRoutes = Express.Router();

userRoutes
  .route("/api/user/avatar")
  .post(verifyToken, upload.single("file"), uploadAvatar);

userRoutes.route("/api/user").get(verifyToken, getAvatar);

export default userRoutes;
