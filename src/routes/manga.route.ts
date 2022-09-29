import Express from "express";
import {
  newRegister,
  updateRegister,
} from "../controllers/commands.controller";
import { followingData, searchManga } from "../controllers/user.controller";

const mangaRoutes = Express.Router();

mangaRoutes.route("/api/new").post(newRegister);
mangaRoutes.route("/api/update").post(updateRegister);
mangaRoutes.route("/api/list").post(followingData);
mangaRoutes.route("/api/search").post(searchManga)

export default mangaRoutes;
