import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./src/routes/auth.routes";
import followRoutes from "./src/routes/follow.routes";
import mangaRoutes from "./src/routes/manga.routes";
import refreshRoute from "./src/routes/refreshToken.routes";

dotenv.config({ path: __dirname + "/.env" });
const port = process.env.PORT;

const app: Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authRoutes);
app.use(followRoutes);
app.use(mangaRoutes);
app.use(refreshRoute);
app.use(cors({ credentials: true, origin: true }));

app.listen(port, () => {
  console.log(`Server ON! Listening port ${port}...`);
});
