import { userModel } from "../models/UserModel";
import { conn } from "../config/connection";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const signUp = async (req: Request, res: Response) => {
  const { email, password, username } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await userModel.create({
      avatar: "",
      username: username,
      password: hashedPassword,
      email: email,
      following: [],
    });
    res.status(200).json({
      message: "O usuário foi registrado com sucesso",
    });
  } catch (err) {
    res.status(500).json({
      message: "Aconteceu um erro no seu registro...",
    });
  }
};

module.exports = { signUp };
