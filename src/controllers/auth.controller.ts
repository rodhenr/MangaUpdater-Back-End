import { userModel } from "../models/UserModel";
import { conn } from "../config/connection";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const signUp = async (req: Request, res: Response) => {
  if (!req.body.email || !req.body.password || !req.body.username)
    return res.status(400).send({
      message: "Dados inválidos",
    });

  const { email, password, username } = req.body;

  if (!email || !password || !username)
    return res.status(400).send({
      message: "Dados inválidos",
    });
  //criar middleware para lidar com inputs incorretos

  const session = await conn.startSession();

  try {
    session.startTransaction();

    const hashedPassword = await bcrypt.hash(password, 10);
    await userModel.create({
      avatar: "",
      username: username,
      password: hashedPassword,
      email: email,
      following: [],
    });
    res.status(200).send({
      message: "O usuário foi registrado com sucesso",
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).send({
      message: "Aconteceu um erro no seu registro...",
    });
  }
};

const signIn = async (req: Request, res: Response) => {
  
}

export { signIn, signUp };
