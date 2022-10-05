import Express from "express";
import { getSearch } from "../controllers/search.controller";
import { verifyGetSearch } from "../middlewares/verifyId.middleware";

const searchRoutes = Express.Router();

searchRoutes.route("/api/search").get(verifyGetSearch, getSearch);

export default searchRoutes;
