import { mangaModel } from "../models/MangaModel";
import { userModel } from "../models/UserModel";
import { conn } from "../config/connection";
import { Request, Response } from "express";
import { AxiosError } from "axios";
import dotenv from "dotenv";

dotenv.config();

const followingData = async (req: Request, res: Response) => {
  if (!req.body.userName) return res.status(400).send("Dados inválidos!");
  const { userName } = req.body;

  const session = await conn.startSession();
  try {
    session.startTransaction();
    const user = await userModel.findOne({ username: userName });

    if (!user) return res.status(404).send("Usuário não encontrado");

    const following = await Promise.all(
      user.following.map((i) => {
        return mangaModel.findById(i.mangaId);
      })
    );

    const userReturn = following.map((i) => {
      if (i?.chapters) {
        if (i.chapters.length > 3) {
          return {
            ...i,
            chapters: [i.chapters[0], i.chapters[1], i.chapters[2]],
          };
        } else {
          return i;
        }
      }
    });

    res.status(200).json({ data: userReturn });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    const err = error as AxiosError;
    res.status(500).send("Ops... Ocorreu um erro na sua requisição!");
  }
};

export { followingData };
