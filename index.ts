import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./src/routes/auth.route";
import mangaRoutes from "./src/routes/manga.route";

dotenv.config({ path: __dirname + "/.env" });
const port = process.env.PORT;

const app: Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authRoutes);
app.use(mangaRoutes);
app.use(cors({ credentials: true, origin: true }));

app.listen(port, () => {
  console.log(`Server ON! Listening port ${port}...`);
});
