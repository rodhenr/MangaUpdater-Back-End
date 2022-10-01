import { mangaModel } from "../models/MangaModel";
import { userModel } from "../models/UserModel";
import { Request, Response } from "express";
import { AxiosError } from "axios";
import { searchInfo } from "../utils/mangaInfo";
import { conn } from "../config/connection";

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

    if (!manga || !user) return res.status(404).send("Dados não encontrados.");

    await userModel.findByIdAndUpdate(user._id, {
      following: [
        ...user.following,
        {
          mangaId: manga._id,
          lastRead: [],
          source: [
            { name: manga.sources[0].name, linkId: manga.sources[0].linkId }, // Arrumar para passar source por req.body
          ],
        },
      ],
    });
    return res.status(200).send("Seguindo!");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    const err = error as AxiosError;
    res.status(500).send("Ops... Ocorreu um erro na sua requisição!");
  }
};

const deleteFollowManga = async (req: Request, res: Response) => {
  if (!req.body.id || !req.body.userName || !req.body.source)
    return res.status(400).send("Dados inválidos!");

  const { userName, source, id } = req.body; // id do mongoose

  const session = await conn.startSession();
  try {
    session.startTransaction();

    const manga = await mangaModel.findById(id);

    const user = await userModel.findOne({
      name: userName,
    });

    if (!manga || !user) return res.status(404).send("Dados não encontrados.");

    // Se estiver seguindo só uma fonte -> deleta
    // Se estiver seguindo de mais de uma fonte -> remove apenas o source
    // Se não estiver seguindo, retorna erro

    const newFollowing = user.following.filter((i) => {
      if (id !== i.mangaId) {
        return i;
      } else {
        if (i.sources.length > 1) {
          return i.sources.filter((j) => j.name !== source);
        } else {
          return;
        }
      }
    });

    console.log(newFollowing);

    /*await userModel.findByIdAndUpdate(user._id, {
      following: [...user.following, { mangaId: manga._id, lastRead: [] }],
    });

    return res.status(200).send("Parou de seguir!");*/
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
      .filter((j) => j !== "" && j !== undefined);

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

export { deleteFollowManga, followNewManga, followingData, searchManga };
