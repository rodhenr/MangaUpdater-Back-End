import { mangaModel, IManga } from "../models/MangaModel";
import { userModel } from "../models/UserModel";
import { Request, Response } from "express";
import { AxiosError } from "axios";
import dotenv from "dotenv";
import { searchInfo } from "../utils/mangaInfo";
import { conn } from "../config/connection";

dotenv.config();

const updateAllFollowing = async (data: string[]) => {
  const newData = await Promise.all(
    data.map((i) => {
      return searchInfo(i);
    })
  );

  return newData;
};

const followNewManga = async (req: Request, res: Response) => {
  if (!req.body.id || !req.body.userName)
    return res.status(400).send("Dados inválidos!");

  const { userName, id } = req.body;

  const session = await conn.startSession();
  try {
    session.startTransaction();

    const manga = await mangaModel.findOne({
      sources: {
        $elemMatch: { linkId: id },
      },
    });

    const user = await userModel.findOneAndUpdate({
      name: userName,
    });

    if (!manga || !user) return res.status(404).send("Não encontrado");

    await userModel.findByIdAndUpdate(user._id, {
      following: [...user.following, { mangaId: manga._id, lastRead: [] }],
    });
    return res.status(200).send("Usuário seguindo novo mangá!");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    const err = error as AxiosError;
    res.status(500).send("Ops... Ocorreu um erro na sua requisição!");
  }
};

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

    const ids = following
      .map((i) => {
        if (i !== null) {
          return i.sources[0].linkId;
        } else {
          return "";
        }
      })
      .filter((j) => j !== "");

    const newData = await updateAllFollowing(ids);

    await Promise.all(
      newData.map((i) => {
        return mangaModel.updateOne({
          sources: {
            $elemMatch: { linkId: i.sources[0].linkId },
          },
        });
      })
    );

    const userReturn = newData.map((i) => {
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

const searchManga = async (req: Request, res: Response) => {
  if (!req.body.name) return res.status(400).send("Dados inválidos!");
  const { name } = req.body;

  try {
    const manga = await mangaModel.find({
      name: { $regex: name, $options: "i" },
    });

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

export { followNewManga, followingData, searchManga };
