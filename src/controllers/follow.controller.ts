import { mangaModel } from "../models/MangaModel";
import { userModel, IFollowing } from "../models/UserModel";
import { Request, Response } from "express";
import { AxiosError } from "axios";
import { conn } from "../config/connection";
import { isValidObjectId } from "mongoose";
import { sourceModel } from "../models/SourceModel";

const newFollow = async (req: Request | any, res: Response) => {
  const { mangaID, sourceID } = req.body;
  const { userEmail } = req;

  const session = await conn.startSession();

  try {
    session.startTransaction();

    //Verificações na DB
    const sourceObj = isValidObjectId(sourceID);
    const mangaObj = isValidObjectId(mangaID);
    if (!sourceObj || !mangaObj) return res.status(400).send("IDs inválidas.");
    const manga = await mangaModel.findById(mangaID);
    if (!manga) return res.status(404).send("Mangá não encontrado.");
    const user = await userModel.findOne({
      email: userEmail,
    });
    if (!user) return res.status(404).send("Usuário não encontrado.");
    const source = await sourceModel.findById(sourceID);
    if (!source) return res.status(404).send("Source não encontrada.");

    //Verifica se o usuário já está seguindo o mangá em questão
    const isFollow = user.following.some((i) => String(i.mangaID) === mangaID);
    if (isFollow)
      return res.status(400).send("Você já está seguindo este mangá!");

    const pathID = manga.sources.filter(
      (i) => String(i.sourceID) === sourceID
    )[0].pathID;

    //Atualiza a DB
    await userModel.findByIdAndUpdate(user._id, {
      following: [
        {
          mangaID,
          sources: [{ sourceID, pathID }],
        },
        ...user.following,
      ],
    });

    session.endSession();
    return res.sendStatus(200);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).send("Ops... Ocorreu um erro na sua requisição!");
  }
};

const updateFollow = async (req: Request | any, res: Response) => {
  const { action, pathID, mangaID, sourceID } = req.body;
  const { userEmail } = req;

  const session = await conn.startSession();
  try {
    session.startTransaction();

    //Verificações na DB
    const sourceObj = isValidObjectId(sourceID);
    const mangaObj = isValidObjectId(mangaID);
    if (!sourceObj || !mangaObj) return res.status(400).send("IDs inválidas.");
    const manga = await mangaModel.findById(mangaID);
    if (!manga) return res.status(404).send("Mangá não encontrado.");
    const user = await userModel.findOne({
      email: userEmail,
    });
    if (!user) return res.status(404).send("Usuário não encontrado.");
    const source = await sourceModel.findById(sourceID);
    if (!source) return res.status(404).send("Source não encontrada.");

    //Verifica se o usuário já está seguindo o mangá em questão
    const isFollow = user.following.some((i) => String(i.mangaID) === mangaID);
    if (!isFollow)
      return res.status(400).send("Você não está seguindo este mangá.");

    let followData: IFollowing[];

    //Executa a ação necessário
    if (action === "add") {
      followData = user.following.map((i) => {
        const isNew = i.sources.every((j) => String(j.sourceID) !== sourceID);
        if (String(i.mangaID) !== mangaID || !isNew) {
          return i;
        } else {
          return {
            mangaID: i.mangaID,
            sources: [{ sourceID, pathID }, ...i.sources],
          };
        }
      });
    } else if (action === "delete") {
      followData = user.following.map((i) => {
        const isIn = i.sources.some((j) => String(j.sourceID) === sourceID);
        if (String(i.mangaID) !== mangaID || !isIn) {
          return i;
        } else {
          const newArray = i.sources.filter(
            (k) => String(k.sourceID) !== sourceID
          );
          return { mangaID: i.mangaID, sources: [...newArray] };
        }
      });
    } else {
      return res.status(400).send("Ação inválida!");
    }

    const filteredFollowData = followData.filter((i) => i.sources.length > 0);

    //Atualiza a DB
    await userModel.findByIdAndUpdate(user._id, {
      following: [...filteredFollowData],
    });

    session.endSession();
    return res.sendStatus(200);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).send("Ops... Ocorreu um erro na sua requisição!");
  }
};

const deleteFollow = async (req: Request | any, res: Response) => {
  const { mangaID } = req.body;
  const { userEmail } = req;

  const session = await conn.startSession();
  try {
    session.startTransaction();

    //Verificações na DB
    const mangaObj = isValidObjectId(mangaID);
    if (!mangaObj) return res.status(400).send("IDs inválidas.");
    const manga = await mangaModel.findById(mangaID);
    if (!manga) return res.status(404).send("Mangá não encontrado.");
    const user = await userModel.findOne({
      email: userEmail,
    });
    if (!user) return res.status(404).send("Usuário não encontrado.");

    //Verifica se o usuário já está seguindo o mangá em questão
    const isFollow = user.following.some((i) => String(i.mangaID) === mangaID);
    if (!isFollow)
      return res.status(400).send("Você não está seguindo este mangá.");

    //Atualiza a DB
    const followData: IFollowing[] = user.following.filter(
      (i) => String(i.mangaID) !== mangaID
    );
    await userModel.findByIdAndUpdate(user._id, {
      following: [...followData],
    });

    session.endSession();
    return res.sendStatus(200);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).send("Ops... Ocorreu um erro na sua requisição!");
  }
};

export { deleteFollow, newFollow, updateFollow };
