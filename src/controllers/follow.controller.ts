import { mangaModel } from "../models/MangaModel";
import { userModel, IFollowing } from "../models/UserModel";
import { Request, Response } from "express";
import { AxiosError } from "axios";
import { conn } from "../config/connection";

const newFollow = async (req: Request | any, res: Response) => {
  if (!req.body.mangaId || !req.body.linkId || !req.body.sourceId)
    return res.status(400).send("Dados inválidos!");

  const { linkId, mangaId, sourceId } = req.body;
  const { userEmail } = req;

  const session = await conn.startSession();

  try {
    session.startTransaction();

    //Procura pelo item e pelo usuário na DB
    const manga = await mangaModel.findById(mangaId);
    if (!manga) return res.status(404).send("Dados não encontrados.");
    const user = await userModel.findOne({
      email: userEmail,
    });
    if (!user) return res.status(404).send("Dados não encontrados.");

    //Verifica se o usuário já está seguindo o mangá em questão
    const isFollow = user.following.some((i) => i.mangaId === mangaId);
    if (isFollow)
      return res.status(400).send("Você já está seguindo este mangá!");

    //Atualiza a DB
    await userModel.findByIdAndUpdate(user._id, {
      following: [
        { mangaId: mangaId, sources: [linkId, sourceId] },
        ...user.following,
      ],
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

    //Procura pelo item e pelo usuário na DB
    const manga = await mangaModel.findById(mangaId);
    if (!manga) return res.status(404).send("Dados não encontrados.");
    const user = await userModel.findOne({
      email: userEmail,
    });
    if (!user) return res.status(404).send("Dados não encontrados.");

    //Verifica se o usuário já está seguindo o mangá em questão
    const isFollow = user.following.some((i) => i.mangaId === mangaId);
    if (!isFollow)
      return res.status(400).send("Você não está seguindo este mangá!");

    let followData: IFollowing[];

    //Executa a ação necessário
    if (action === "add") {
      followData = user.following.map((i) => {
        const isNew = i.sources.every((j) => j.id !== sourceId);
        if (i.mangaId !== mangaId || !isNew) {
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
        const isIn = i.sources.some((j) => j.id === sourceId);
        if (i.mangaId !== mangaId || !isIn) {
          return i;
        } else {
          const newArray = i.sources.filter((k) => k.id !== sourceId);
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

    //Procura pelo item e pelo usuário na DB
    const manga = await mangaModel.findById(mangaId);
    if (!manga) return res.status(404).send("Dados não encontrados.");
    const user = await userModel.findOne({
      email: userEmail,
    });
    if (!user) return res.status(404).send("Dados não encontrados.");

    //Verifica se o usuário já está seguindo o mangá em questão
    const isFollow = user.following.some((i) => i.mangaId === mangaId);
    if (!isFollow)
      return res.status(400).send("Você não está seguindo este mangá!");

    //Atualiza a DB
    const followData: IFollowing[] = user.following.filter(
      (i) => i.mangaId !== mangaId
    );
    await userModel.findByIdAndUpdate(user._id, {
      following: [...followData],
    });

    session.endSession();
    return res.status(200).send("Parou de seguir!");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    const err = error as AxiosError;
    res.status(500).send("Ops... Ocorreu um erro na sua requisição!");
  }
};

const getFollows = async (req: Request, res: Response) => {
  /*if (!req.body.name) return res.status(400).send("Dados inválidos!");
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
  */
};

export { deleteFollow, getFollows, newFollow, updateFollow };
