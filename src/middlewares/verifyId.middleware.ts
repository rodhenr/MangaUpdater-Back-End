import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

//Verifica várias entradas de dados

const verifyNewFollow = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  if (!req.body.mangaID || !req.body.sourceID)
    return res.status(400).send("Dados inválidos!");

  next();
};

const verifyUpdateFollow = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  if (
    !req.body.action ||
    !req.body.mangaID ||
    !req.body.pathID ||
    !req.body.sourceID
  )
    return res.status(400).send("Dados inválidos!");

  next();
};

const verifyDeleteFollow = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  next();
};

const verifyNewManga = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  if (!req.body.muPathID || !req.body.mlPathID)
    return res.status(400).send("Dados inválidos!");

  next();
};

const verifyUpdateManga = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  if (!req.body.mangaID) return res.status(400).send("Dados inválidos!");

  next();
};

const verifyGetManga = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  if (!req.userEmail) return res.status(400).send("Dados inválidos!");

  next();
};

const verifyGetMangaModal = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  if (!req.query.mangaID) return res.status(400).send("Dados inválidos!");

  next();
};

const verifyGetSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.query.word) return res.status(400).send("Dados inválidos!");

  next();
};

export {
  verifyDeleteFollow,
  verifyNewFollow,
  verifyUpdateFollow,
  verifyUpdateManga,
  verifyNewManga,
  verifyGetManga,
  verifyGetMangaModal,
  verifyGetSearch,
};
