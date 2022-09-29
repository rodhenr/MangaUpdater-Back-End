import { mangaModel } from "../models/MangaModel";
import { conn } from "../config/connection";
import { Request, Response } from "express";
import { AxiosError } from "axios";
import { searchInfo } from "../utils/mangaInfo";
import dotenv from "dotenv";

dotenv.config();

const newRegister = async (req: Request, res: Response) => {
  if (!req.body.id) return res.status(400).send("ID inválido!");
  const { id } = req.body;

  const session = await conn.startSession();
  try {
    session.startTransaction();
    const isNew = await mangaModel.findOne({
      sources: {
        $elemMatch: { id: id },
      },
    });

    if (isNew) return res.status(400).send("ID já cadastrada!");

    const mangaInfoData = await searchInfo(id, true);

    await mangaModel.create(mangaInfoData);

    res.status(200).send("Registro criado com sucesso!");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    const err = error as AxiosError;
    if (err.response?.status === 404)
      return res.status(400).send("ID inválida!");
    res.status(500).send("Ops... Ocorreu um erro na sua requisição!");
  }
};

const updateRegister = async (req: Request, res: Response) => {
  if (!req.body.id) return res.status(400).send("ID inválido!");
  const { id } = req.body;

  const session = await conn.startSession();
  try {
    session.startTransaction();
    const manga = await mangaModel.findOne({
      sources: {
        $elemMatch: { linkId: id },
      },
    });

    if (manga === null) {
      const mangaInfoData = await searchInfo(id, true);
      await mangaModel.create(mangaInfoData);
      res.status(200).send("Registro criado com sucesso!");
    } else {
      const mangaInfoData = await searchInfo(id, false);
      if (manga.chapters[0].number === mangaInfoData.chapters[0].number) {
        return res.status(200).send("Último capítulo já atualizado!");
      } else {
        await mangaModel.findByIdAndUpdate(manga._id, {
          chapters: [...manga.chapters, mangaInfoData.chapters[0]],
        });
        res.status(200).send("Registro atualizado com sucesso!");
      }
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    const err = error as AxiosError;
    if (err.response?.status === 404)
      return res.status(400).send("ID inválida!");
    res.status(500).send("Ops... Ocorreu um erro na sua requisição!");
  }
};

export { newRegister, updateRegister };
