import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./src/routes/auth.routes";
import followRoutes from "./src/routes/follow.routes";
import mangaRoutes from "./src/routes/manga.routes";
import searchRoutes from "./src/routes/search.routes";

dotenv.config({ path: __dirname + "/.env" });
const port = process.env.PORT;

const app: Express = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(authRoutes);
app.use(followRoutes);
app.use(mangaRoutes);
app.use(searchRoutes);
app.use(cors({ credentials: true, origin: true }));

app.listen(port, () => {
  console.log(`Server ON! Listening port ${port}...`);
});
