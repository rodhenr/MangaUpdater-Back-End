import { Request, Response, NextFunction } from "express";
import { conn } from "../config/connection";
import { userModel } from "../models/UserModel";
import "dotenv/config";

// Faz o upload de um novo avatar
const uploadAvatar = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  const { userEmail } = req;
  const session = await conn.startSession();

  try {
    session.startTransaction();
    if (req.file === undefined)
      return res.status(401).send("Erro ao fazer upload");

    await userModel.findOneAndUpdate(
      { email: userEmail },
      { config: { avatar: req.file.filename } }
    );

    session.endSession();
    return res.status(200).json("Upload realizado com sucesso!");
  } catch (error) {
    session.endSession();
    res.status(500).send("Ops... Ocorreu um erro na sua requisição!");
  }
};

const getAvatar = async (req: Request | any, res: Response) => {
  const { userEmail } = req;
  const { hostname } = req;

  const serverName = `http://${hostname}:${process.env.PORT}/images/`;

  const session = await conn.startSession();

  try {
    session.startTransaction();

    const user = await userModel.findOne({ email: userEmail });

    if (!user) return res.sendStatus(401);

    const userAvatar = `${serverName}${user.config.avatar}`;

    session.endSession();
    return res.status(200).json(userAvatar);
  } catch (error) {
    session.endSession();
    res.status(500).send("Ops... Ocorreu um erro na sua requisição!");
  }
};

export { uploadAvatar, getAvatar };
