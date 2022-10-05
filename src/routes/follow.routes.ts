import Express from "express";
import {
  deleteFollow,
  newFollow,
  updateFollow,
} from "../controllers/follow.controller";
import verifyToken from "../middlewares/verifyJWT.middleware";
import { verifyDeleteFollow, verifyNewFollow, verifyUpdateFollow } from "../middlewares/verifyId.middleware";

const mangaRoutes = Express.Router();

mangaRoutes
  .route("/api/follow")
  .post(verifyToken, verifyNewFollow, newFollow)
  .delete(verifyToken, verifyDeleteFollow, deleteFollow)
  .patch(verifyToken, verifyUpdateFollow, updateFollow);

export default mangaRoutes;
