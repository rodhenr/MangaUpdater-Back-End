import Express from "express";
import { getSearch } from "../controllers/search.controller";

const searchRoutes = Express.Router();

searchRoutes.route("/auth/login").get(getSearch);

export default searchRoutes;
