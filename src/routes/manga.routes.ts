import Express from "express";
import {
  getMangaModal,
  getMangas,
  newManga,
  updateManga,
} from "../controllers/manga.controller";
import {
  verifyNewManga,
  verifyGetManga,
  verifyGetMangaModal,
  verifyUpdateManga,
} from "../middlewares/verifyId.middleware";
import verifyToken from "../middlewares/verifyJWT.middleware";

const mangaRoutes = Express.Router();

mangaRoutes
  .route("/api/manga")
  .get(verifyToken, verifyGetManga, getMangas)
  .post(verifyToken, verifyNewManga, newManga)
  .patch(verifyToken, verifyUpdateManga, updateManga);

mangaRoutes
  .route("/api/manga/modal")
  .get(verifyToken, verifyGetMangaModal, getMangaModal);

export default mangaRoutes;
