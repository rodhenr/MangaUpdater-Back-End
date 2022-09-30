import Express from "express";
import {
  newRegister,
  updateRegister,
} from "../controllers/commands.controller";
import {
  followingData,
  followNewManga,
  searchManga,
} from "../controllers/user.controller";

const mangaRoutes = Express.Router();

mangaRoutes.route("/api/new").post(newRegister);
mangaRoutes.route("/api/update").patch(updateRegister);
mangaRoutes.route("/api/list").post(followingData); // Mudar para GET assim que implementar JWT
mangaRoutes.route("/api/search").post(searchManga);
mangaRoutes.route("/api/follow").post(followNewManga);

export default mangaRoutes;
