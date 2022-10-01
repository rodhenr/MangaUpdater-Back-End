import { userModel } from "../models/UserModel";
import { conn } from "../config/connection";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const register = async (req: Request, res: Response) => {
  if (!req.body.email || !req.body.password || !req.body.username)
    return res.status(400).send("Dados inválidos");

  const { email, password, username } = req.body;

  if (email === "" || password.length < 4 || username.length < 4)
    return res.status(400).send("Dados incompletos");

  const session = await conn.startSession();

  try {
    session.startTransaction();

    const hashedPassword = await bcrypt.hash(password, 10);
    await userModel.create({
      username: username,
      password: hashedPassword,
      email: email,
    });

    session.endSession();

    res.status(200).send({
      message: "Usuário registrado com sucesso!",
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

  if (email === "" || password.length < 4)
    return res.status(400).send("Dados incompletos");

  const session = await conn.startSession();

  try {
    session.startTransaction();

    const user = await userModel.findOne({
      email: email,
    });

    if (!user) return res.status(401).send("Login inválido!");

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(401).send("Login inválido!");

    const userEmail = user.email;

    const accessToken = jwt.sign({ userEmail }, process.env.SECRET, {
      expiresIn: "10m",
    });
    const refreshToken = jwt.sign({ userEmail }, process.env.REFRESH_SECRET, {
      expiresIn: "15m",
    });

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).send({
      message: "Aconteceu um erro no seu registro...",
    });
  }
};

export { login, register };
