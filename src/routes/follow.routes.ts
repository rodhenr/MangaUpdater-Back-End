import Express from "express";
import {
  deleteFollow,
  newFollow,
  updateFollow,
} from "../controllers/follow.controller";
import verifyToken from "../middlewares/verifyJWT.middleware";

const mangaRoutes = Express.Router();

mangaRoutes
  .route("/api/follow")
  .post(verifyToken, newFollow)
  .delete(verifyToken, deleteFollow)
  .patch(verifyToken, updateFollow);

export default mangaRoutes;
