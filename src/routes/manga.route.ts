import Express from "express";
import { newRegister } from "../controllers/commands.controller";

const mangaRoutes = Express.Router();

mangaRoutes.route("/api/new").post(newRegister);

export default mangaRoutes;
