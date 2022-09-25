import mongoose from "mongoose";

const db_URL = "mongodb://localhost:27017/mangaupdaterDB";
mongoose.connect(db_URL);

const conn = mongoose.connection;
conn.on("error", () => console.error.bind(console, "connection error"));
conn.once("open", () => console.info("Connected to database"));

export { conn };
