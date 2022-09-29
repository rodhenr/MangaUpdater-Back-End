import { mangaModel } from "../models/MangaModel";
import { userModel } from "../models/UserModel";
import { Request, Response } from "express";
import { AxiosError } from "axios";
import dotenv from "dotenv";

dotenv.config();

const followingData = async (req: Request, res: Response) => {
  if (!req.body.userName) return res.status(400).send("Dados inválidos!");
  const { userName } = req.body;

  try {
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
    const err = error as AxiosError;
    res.status(500).send("Ops... Ocorreu um erro na sua requisição!");
  }
};

const searchManga = async (req: Request, res: Response) => {
  if (!req.body.name) return res.status(400).send("Dados inválidos!");
  const { name } = req.body;

  try {
    const manga = await mangaModel.find({
      name: { $regex: name },
    });

    console.log(manga);

    if (manga === null || !manga || manga.length === 0)
      return res.status(200).json({ error: "Nenhum resultado encontrado." });

    const mangaData = manga.map((i) => {
      return {
        id: i._id,
        name: i.name,
        lastChapter: i.chapters[0] ? i.chapters[0].number : "0",
        source: i.chapters[0] ? i.chapters[0].source : "0",
      };
    });

    res.status(200).json({ data: mangaData });
  } catch (error) {
    const err = error as AxiosError;
    res.status(500).send("Ops... Ocorreu um erro na sua requisição!");
  }
};

export { followingData, searchManga };
