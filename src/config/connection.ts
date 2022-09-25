import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(`${process.env.DATABASE_URL}`);

const conn = mongoose.connection;
conn.on("error", () => console.error.bind(console, "connection error"));
conn.once("open", () => console.info("Connected to database"));

export { conn };