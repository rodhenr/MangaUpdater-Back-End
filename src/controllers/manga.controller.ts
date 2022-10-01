import { mangaModel } from "../models/MangaModel";
import { conn } from "../config/connection";
import { Request, Response } from "express";
import { AxiosError } from "axios";
import { searchInfo } from "../utils/mangaInfo";
import { userModel } from "../models/UserModel";
import { isValidObjectId, Schema } from "mongoose";
import { sourceModel } from "../models/SourceModel";

interface ISource {
  id: Schema.Types.ObjectId;
  linkId: string;
}

const newManga = async (req: Request, res: Response) => {
  if (!req.body.linkId || !req.body.sourceId)
    return res.status(400).send("Dados inválidos!");
  const { linkId, sourceId } = req.body;

  const session = await conn.startSession();

  try {
    session.startTransaction();

    //Verifica se já existe na DB
    const isNew = await mangaModel.findOne({
      sources: {
        $elemMatch: { linkId, id: sourceId },
      },
    });
    if (isNew) return res.status(400).send("ID já cadastrada!");

    // Cadastra o novo item na DB
    const mangaInfoData = await searchInfo(linkId, sourceId);
    await mangaModel.create(mangaInfoData);

    session.endSession();
    res.status(200).send("Registro criado com sucesso!");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    const err = error as AxiosError;
    if (err.response?.status === 404)
      return res.status(400).send("ID inválida!");
    console.log(error);
    res.status(500).send("Ops... Ocorreu um erro na sua requisição!");
  }
};

const updateManga = async (req: Request, res: Response) => {
  if (!req.body.linkId || !req.body.sourceId)
    return res.status(400).send("Dados inválidos!");
  const { linkId, sourceId } = req.body;

  const session = await conn.startSession();

  try {
    session.startTransaction();

    //Verifica se já existe na DB
    const manga = await mangaModel.findOne({
      sources: {
        $elemMatch: { linkId, id: sourceId },
      },
    });
    if (!manga) return res.status(400).send("Item não localizado.");

    //Verifica se a sourceId é válida e se existe na DB
    const obj = isValidObjectId(sourceId);
    console.log(obj);
    if (!obj) return res.status(400).send("SourceId inválida.");
    const source = await sourceModel.findById(sourceId);
    if (!source) return res.status(400).send("Source não localizada.");

    //Busca os dados do novo capítulo
    const mangaInfoData = await searchInfo(linkId, sourceId);

    //Procura por algum capítulo anterior da source passada via parâmetro
    const hasChapter = manga.chapters.filter((i) => i.source === sourceId);

    //Atualiza ou não o item em questão
    if (hasChapter.length === 0) {
      //Atualiza a DB
      await mangaModel.findByIdAndUpdate(manga._id, {
        chapters: [mangaInfoData.chapter, ...manga.chapters],
      });
    } else {
      //Recebe todos capítulos que não são da source atual
      const filterChapters = manga.chapters.filter(
        (i) => i.source !== sourceId
      );

      //Atualiza a DB
      await mangaModel.findByIdAndUpdate(manga._id, {
        chapters: [mangaInfoData.chapter, ...filterChapters],
      });
    }

    session.endSession();
    res.status(200).send("Registro atualizado com sucesso!");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    const err = error as AxiosError;
    if (err.response?.status === 404)
      return res.status(400).send("ID inválida!");
    res.status(500).send("Ops... Ocorreu um erro na sua requisição!");
  }
};

const getMangas = async (req: Request, res: Response) => {
  /* if (!req.userEmail) return res.status(400).send("Dados inválidos!");

  //Recebe o parâmetro através do middleware que verifica o token
  const { userEmail } = req;

  const session = await conn.startSession();

  try {
    session.startTransaction();

    //Procura e valida o usuário
    const user = await userModel.findOne({ email: userEmail });
    if (!user) return res.status(404).send("Usuário não encontrado");

    //Gera um objeto para cada item e source que o usuário segue
    const ids = user.following.map((i) => {
      if (i.sources.length > 1) {
        const listSources = i.sources.map((j) => {
          return { linkId: j.linkId, sourceId: j.id };
        });
        return { ...listSources };
      } else {
        return { linkId: i.sources[0].linkId, sourceId: i.sources[0].id };
      }
    });

    //Atualiza todos itens
    const newData = await Promise.all(
      ids.map((i) => {
        return searchInfo(i.linkId!, i.sourceId!);
      })
    );

    //Atualiza a BD
    await Promise.all(
      newData.map((i) => {
        mangaModel.updateOne({
          sources: {
            $elemMatch: { linkId: i.sources[0].linkId },
          },
        });
      })
    );

    const userReturn = newData.map((i) => {
      if (i?.chapter) {
        return i;
      }
    });

    //res.status(200).json({ data: userReturn });
    res.status(200).json({ data: ids });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    const err = error as AxiosError;
    res.status(500).send("Ops... Ocorreu um erro na sua requisição!");
  }
  */
};

export { getMangas, newManga, updateManga };
