import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(cors({ credentials: true, origin: true }));

app.listen(port, () => {
  console.log(`Server ON! Listening port ${port}...`);
});
