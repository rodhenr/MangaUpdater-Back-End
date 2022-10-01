import { userModel } from "../models/UserModel";
import { conn } from "../config/connection";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import "dotenv/config";

const register = async (req: Request, res: Response) => {
  const { email, password, username } = req.body;
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

    res.status(200).send("Usuário registrado com sucesso!");
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).send("Aconteceu um erro no seu registro...");
  }
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const session = await conn.startSession();

  try {
    session.startTransaction();

    if (!process.env.REFRESH_SECRET || !process.env.SECRET)
      throw Error("Server error");

    const user = await userModel.findOne({
      email: email,
    });

    if (!user) return res.status(401).send("Login inválido!");

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(401).send("Login inválido!");

    const userEmail = user.email;

    const accessToken = jwt.sign({ userEmail }, process.env.SECRET, {
      expiresIn: 60 * 60,
    });
    const refreshToken = jwt.sign({ userEmail }, process.env.REFRESH_SECRET, {
      expiresIn: 60 * 60,
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
    console.log(err);
    res.status(500).send("Ops... Ocorreu um erro no servidor.");
  }
};

export { login, register };
