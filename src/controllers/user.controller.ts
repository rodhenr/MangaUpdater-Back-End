import { Request, Response, NextFunction } from "express";
import { conn } from "../config/connection";
import { upload } from "../middlewares/avatar.middleware";

// Faz o upload de um novo avatar
const uploadAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = await conn.startSession();

  try {
    session.startTransaction();

    await upload(req, res, next);
    console.log(req.file);

    if (req.file === undefined)
      return res
        .status(401)
        .send("Ocorreu um problema no upload da sua imagem...");

    session.endSession();
    res.sendStatus(200);
  } catch (error) {
    session.endSession();
    res.status(500).send("Ops... Ocorreu um erro na sua requisição!");
  }
};

export { uploadAvatar };
