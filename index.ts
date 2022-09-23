import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(cors({ credentials: true, origin: true }));

//mongoose connection
mongoose.connect("mongodb://localhost:27017/mangaupdaterDB", () => {
  console.log("connected to database");
});

app.listen(port, () => {
  console.log(`Server ON! Listening port ${port}...`);
});
