import { userModel } from "../models/UserModel";
import { conn } from "../config/connection";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import "dotenv/config";

const secret = process.env.SECRET ?? "secret"; // remover
const refreshSecret = process.env.REFRESH_SECRET ?? "secret"; // remover

// Cadastra um novo usuário
const register = async (req: Request, res: Response) => {
  const { email, password, username, language } = req.body;
  const session = await conn.startSession();

  try {
    session.startTransaction();

    const hashedPassword = await bcrypt.hash(password, 10);
    await userModel.create({
      username: username,
      password: hashedPassword,
      email: email,
      config: { avatar: "", language },
    });

    session.endSession();

    res.status(200).send("Usuário registrado com sucesso!");
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).send("Aconteceu um erro no seu registro...");
  }
};

// Faz login na aplicação
const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { hostname } = req;

  const serverName = `http://${hostname}:${process.env.PORT}/images/`;

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
    const userName = user.username;
    const userAvatar = `${serverName}${user.config.avatar}`;

    const accessToken = jwt.sign({ userEmail, userName }, secret, {
      expiresIn: 100 * 60,
    });
    const refreshToken = jwt.sign({ userEmail, userName }, refreshSecret, {
      expiresIn: 15 * 60,
    });

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken, user: userName, userAvatar });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).send("Ops... Ocorreu um erro no servidor.");
  }
};

// Atualiza o token do usuário
const refreshToken = (req: Request, res: Response) => {
  if (!process.env.REFRESH_SECRET || !process.env.SECRET)
    return res.status(500).send("Erro no servidor.");

  const cookies = req.cookies;

  if (!cookies?.jwt) return res.sendStatus(401);

  const refreshToken = cookies.jwt;
  res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
  jwt.verify(refreshToken, secret, (err: any, decoded: any) => {
    if (err) {
      return res.status(406).json("Refresh Token expired");
    } else {
      const { userEmail, userName } = decoded;
      const accessToken = jwt.sign({ userEmail, userName }, secret, {
        expiresIn: 100 * 60,
      });

      const refreshToken = jwt.sign({ userEmail, userName }, refreshSecret, {
        expiresIn: 15 * 60,
      });

      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.json({ accessToken, user: userName });
    }
  });
};

export { login, register, refreshToken };
