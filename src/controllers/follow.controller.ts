import { mangaModel } from "../models/MangaModel";
import { userModel, IFollowing } from "../models/UserModel";
import { Request, Response } from "express";
import { AxiosError } from "axios";
import { conn } from "../config/connection";
import { isValidObjectId } from "mongoose";
import { sourceModel } from "../models/SourceModel";

const newFollow = async (req: Request | any, res: Response) => {
  if (!req.body.mangaId || !req.body.linkId || !req.body.sourceId)
    return res.status(400).send("Dados inválidos!");

  const { linkId, mangaId, sourceId } = req.body;
  const { userEmail } = req;

  const session = await conn.startSession();

  try {
    session.startTransaction();

    //Verificações na DB
    const sourceObj = isValidObjectId(sourceId);
    const mangaObj = isValidObjectId(mangaId);
    if (!sourceObj || !mangaObj) return res.status(400).send("IDs inválidas.");
    const manga = await mangaModel.findById(mangaId);
    if (!manga) return res.status(404).send("Mangá não encontrado.");
    const user = await userModel.findOne({
      email: userEmail,
    });
    if (!user) return res.status(404).send("Usuário não encontrado.");
    const source = await sourceModel.findById(sourceId);
    if (!source) return res.status(404).send("Source não encontrada.");

    //Verifica se o usuário já está seguindo o mangá em questão
    const isFollow = user.following.some((i) => String(i.mangaId) === mangaId);
    if (isFollow)
      return res.status(400).send("Você já está seguindo este mangá!");

    //Atualiza a DB
    await userModel.findByIdAndUpdate(user._id, {
      following: [
        { mangaId: mangaId, sources: [{ linkId, id: sourceId }] },
        ...user.following,
      ],
    });

    session.endSession();
    return res.sendStatus(200);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error);
    const err = error as AxiosError;
    res.status(500).send("Ops... Ocorreu um erro na sua requisição!");
  }
};

const updateFollow = async (req: Request | any, res: Response) => {
  if (
    !req.body.action ||
    !req.body.mangaId ||
    !req.body.linkId ||
    !req.body.sourceId
  )
    return res.status(400).send("Dados inválidos!");

  const { action, linkId, mangaId, sourceId } = req.body;
  const { userEmail } = req;

  const session = await conn.startSession();
  try {
    session.startTransaction();

    //Verificações na DB
    const sourceObj = isValidObjectId(sourceId);
    const mangaObj = isValidObjectId(mangaId);
    if (!sourceObj || !mangaObj) return res.status(400).send("IDs inválidas.");
    const manga = await mangaModel.findById(mangaId);
    if (!manga) return res.status(404).send("Mangá não encontrado.");
    const user = await userModel.findOne({
      email: userEmail,
    });
    if (!user) return res.status(404).send("Usuário não encontrado.");
    const source = await sourceModel.findById(sourceId);
    if (!source) return res.status(404).send("Source não encontrada.");

    //Verifica se o usuário já está seguindo o mangá em questão
    const isFollow = user.following.some((i) => String(i.mangaId) === mangaId);
    if (!isFollow)
      return res.status(400).send("Você não está seguindo este mangá.");

    let followData: IFollowing[];

    //Executa a ação necessário
    if (action === "add") {
      followData = user.following.map((i) => {
        const isNew = i.sources.every((j) => String(j.id) !== sourceId);
        if (String(i.mangaId) !== mangaId || !isNew) {
          return i;
        } else {
          return {
            mangaId: i.mangaId,
            sources: [{ id: sourceId, linkId }, ...i.sources],
          };
        }
      });
    } else if (action === "delete") {
      followData = user.following.map((i) => {
        const isIn = i.sources.some((j) => String(j.id) === sourceId);
        if (String(i.mangaId) !== mangaId || !isIn) {
          return i;
        } else {
          const newArray = i.sources.filter((k) => String(k.id) !== sourceId);
          return { mangaId: i.mangaId, sources: [...newArray] };
        }
      });
    } else {
      return res.status(400).send("Ação inválida!");
    }

    //Atualiza a DB
    await userModel.findByIdAndUpdate(user._id, {
      following: [...followData],
    });

    session.endSession();
    return res.sendStatus(200);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    const err = error as AxiosError;
    res.status(500).send("Ops... Ocorreu um erro na sua requisição!");
  }
};

const deleteFollow = async (req: Request | any, res: Response) => {
  if (!req.body.mangaId) return res.status(400).send("Dados inválidos!");

  const { mangaId } = req.body;
  const { userEmail } = req;

  const session = await conn.startSession();
  try {
    session.startTransaction();

    //Verificações na DB
    const mangaObj = isValidObjectId(mangaId);
    if (!mangaObj) return res.status(400).send("IDs inválidas.");
    const manga = await mangaModel.findById(mangaId);
    if (!manga) return res.status(404).send("Mangá não encontrado.");
    const user = await userModel.findOne({
      email: userEmail,
    });
    if (!user) return res.status(404).send("Usuário não encontrado.");

    //Verifica se o usuário já está seguindo o mangá em questão
    const isFollow = user.following.some((i) => String(i.mangaId) === mangaId);
    if (!isFollow)
      return res.status(400).send("Você não está seguindo este mangá.");

    //Atualiza a DB
    const followData: IFollowing[] = user.following.filter(
      (i) => String(i.mangaId) !== mangaId
    );
    await userModel.findByIdAndUpdate(user._id, {
      following: [...followData],
    });

    session.endSession();
    return res.sendStatus(200);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    const err = error as AxiosError;
    res.status(500).send("Ops... Ocorreu um erro na sua requisição!");
  }
};

export { deleteFollow, newFollow, updateFollow };
