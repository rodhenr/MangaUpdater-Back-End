import { Request, Response, NextFunction } from "express";
import { conn } from "../config/connection";
import { upload } from "../middlewares/avatar.middleware";
import { userModel } from "../models/UserModel";

// Faz o upload de um novo avatar
const uploadAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userEmail = req;
  const session = await conn.startSession();

  try {
    session.startTransaction();
    if (req.file === undefined) return res.status(401).send("Undefined...");

    userModel.findOneAndUpdate(
      { email: userEmail },
      { config: { avatar: req.file.path } }
    );

    session.endSession();
    return res.status(200).send("Upload feito com sucesso!");
  } catch (error) {
    session.endSession();
    res.status(500).send("Ops... Ocorreu um erro na sua requisição!");
  }
};

export { uploadAvatar };