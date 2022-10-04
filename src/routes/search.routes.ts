import Express from "express";
import { getSearch } from "../controllers/search.controller";

const searchRoutes = Express.Router();

searchRoutes.route("/api/search").get(getSearch);

export default searchRoutes;
