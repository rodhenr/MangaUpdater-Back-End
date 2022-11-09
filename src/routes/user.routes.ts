import Express from "express";
import { uploadAvatar } from "../controllers/user.controller";
import { upload } from "../middlewares/avatar.middleware";
import verifyToken from "../middlewares/verifyJWT.middleware";

const userRoutes = Express.Router();

userRoutes
  .route("/api/user/avatar")
  .post(verifyToken, upload.single("file"), uploadAvatar);

export default userRoutes;
