import { userModel } from "../models/UserModel";
import { conn } from "../config/connection";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const register = async (req: Request, res: Response) => {
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

const login = async (req: Request, res: Response) => {
  if (!req.body.email || !req.body.password)
    return res.status(400).send({
      message: "Dados inválidos",
    });

  const { email, password } = req.body;

  const session = await conn.startSession();

  try {
    session.startTransaction();

    const user = await userModel.findOne({
      email: email,
    });

    if (!user)
      return res
        .status(401)
        .send({ message: "Login inválido! Tente novamente." });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res
        .status(401)
        .send({ message: "Login inválido! Tente novamente." });

    res.status(200).send("Login bem-sucedido!");
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).send({
      message: "Aconteceu um erro no seu registro...",
    });
  }
};

export { login, register };
