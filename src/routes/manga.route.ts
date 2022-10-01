import Express from "express";
import {
  newRegister,
  updateRegister,
} from "../controllers/follow.controller";
import {
  deleteFollowManga,
  followingData,
  followNewManga,
  searchManga,
} from "../controllers/manga.controller";

const mangaRoutes = Express.Router();

mangaRoutes.route("/api/new").post(newRegister);
mangaRoutes.route("/api/update").patch(updateRegister);
mangaRoutes.route("/api/list").post(followingData); // Mudar para GET assim que implementar JWT
mangaRoutes.route("/api/search").post(searchManga);
mangaRoutes.route("/api/follow").post(followNewManga);
mangaRoutes.route("/api/follow").delete(deleteFollowManga);

export default mangaRoutes;
