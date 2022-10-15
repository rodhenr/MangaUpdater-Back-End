import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

const verifyNewFollow = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  if (!req.body.mangaId || !req.body.sourceId)
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
    !req.body.mangaId ||
    !req.body.linkId ||
    !req.body.sourceId
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
  if (!req.body.linkId || !req.body.sourceId || !req.body.mdID)
    return res.status(400).send("Dados inválidos!");

  next();
};

const verifyUpdateManga = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  if (!req.body.linkId || !req.body.sourceId || !req.body.mdID)
    return res.status(400).send("Dados inválidos!");

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
  if (!req.query.mangaId) return res.status(400).send("Dados inválidos!");

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
