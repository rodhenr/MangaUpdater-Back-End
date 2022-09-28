import Express from "express";
import {
  newRegister,
  updateRegister,
} from "../controllers/commands.controller";

const mangaRoutes = Express.Router();

mangaRoutes.route("/api/new").post(newRegister);
mangaRoutes.route("/api/update").post(updateRegister);

export default mangaRoutes;
