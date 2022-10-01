import Express from "express";
import {
  getMangas,
  newManga,
  updateManga,
} from "../controllers/manga.controller";
import verifyToken from "../middlewares/verifyJWT.middleware";

const mangaRoutes = Express.Router();

mangaRoutes
  .route("/api/manga")
  .get(verifyToken, getMangas)
  .post(verifyToken, newManga)
  .patch(verifyToken, updateManga);

export default mangaRoutes;
