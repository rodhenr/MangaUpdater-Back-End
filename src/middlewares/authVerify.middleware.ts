import { userModel } from "../models/UserModel";
import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

// Verifica os dados de registro
const verifyRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (
    !req.body.email ||
    !req.body.password ||
    !req.body.username ||
    !req.body.language
  )
    return res.status(400).send("Dados incompletos!");

  if (
    req.body.email === "" ||
    req.body.password.length < 6 ||
    req.body.username.length < 4
  )
    return res.status(400).send("Dados incompletos!");

  const { username, email } = req.body;

  try {
    const users = await userModel.findOne({
      email: email.toLowerCase(),
    });

    if (users)
      return res
        .status(409)
        .send({ message: "Este usuário já está cadastrado" });

    next();
  } catch (err) {
    return res.status(500).send("Ops... Algo de errado aconteceu!");
  }
};

// Verifica os dados de login
const verifyLogin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.email || !req.body.password)
    return res.status(400).send("Dados incompletos!");

  if (req.body.email === "" || req.body.password.length < 4)
    return res.status(400).send("Dados incompletos!");

  next();
};

export { verifyLogin, verifyRegister };
