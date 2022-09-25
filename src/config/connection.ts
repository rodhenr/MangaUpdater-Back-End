import mongoose from "mongoose";

mongoose.connect("mongodb://localhost:27017/mangaupdaterDB");

const conn = mongoose.connection;

conn.on("error", () => console.error.bind(console, "connection error"));

conn.once("open", () => console.info("Connected to database"));

export { conn };