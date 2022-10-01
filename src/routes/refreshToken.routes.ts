import Express from "express";
import { refreshToken } from "../controllers/refreshToken.controller";

const refreshRoute = Express.Router();

refreshRoute.route("/api/refresh").get(refreshToken);

export default refreshRoute;
