import { mangaModel } from "../models/MangaModel";
import { conn } from "../config/connection";
import { Request, Response } from "express";
import { AxiosError } from "axios";
import { getMangaData } from "../utils/mangaInfo";
import { isValidObjectId } from "mongoose";
import { sourceModel } from "../models/SourceModel";
import { userModel } from "../models/UserModel";

const newManga = async (req: Request, res: Response) => {
  const { linkId, sourceId } = req.body;

  const session = await conn.startSession();

  try {
    //CRIAR ALTERAÇÃO PARA QUE CRIAÇÃO SEJA APENAS DO MANGAUPDATES
    session.startTransaction();

    //Verificações na DB
    const sourceObj = isValidObjectId(sourceId);
    if (!sourceObj) return res.status(400).send("IDs inválidas.");
    const source = await sourceModel.findById(sourceId);
    if (!source) return res.status(404).send("Source não encontrada.");

    //Verifica se já existe na DB
    const isNew = await mangaModel.findOne({
      sources: {
        $elemMatch: { linkId, id: sourceId },
      },
    });
    if (isNew) return res.status(400).send("ID já cadastrada!");

    // Cadastra o novo item na DB
    const mangaInfoData = await getMangaData(linkId, sourceId);
    await mangaModel.create(mangaInfoData);

    session.endSession();
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

const updateManga = async (req: Request, res: Response) => {
  const { linkId, sourceId } = req.body;

  const session = await conn.startSession();

  try {
    session.startTransaction();

    //Verifica se a sourceId é válida e se existe na DB
    const obj = isValidObjectId(sourceId);
    if (!obj) return res.status(400).send("SourceId inválida.");
    const source = await sourceModel.findById(sourceId);
    if (!source) return res.status(400).send("Source não localizada.");

    //Verifica se já existe na DB
    const manga = await mangaModel.findOne({
      sources: {
        $elemMatch: { linkId, id: sourceId },
      },
    });
    if (!manga) return res.status(400).send("Item não localizado.");

    //Busca os dados
    const mangaInfoData = await getMangaData(linkId, sourceId);

    //Procura por algum capítulo anterior da source passada via parâmetro
    const hasChapter = manga.sources.filter((i) => String(i.id) === sourceId);

    //Atualiza a DB se não existir capítulo cadastrado
    if (hasChapter.length === 0) {
      await mangaModel.findByIdAndUpdate(manga._id, {
        sources: [mangaInfoData.sources, ...manga.sources],
      });
      return res.status(200).send("Registro atualizado com sucesso!");
    }

    //Não atualiza a DB se o número do capítulo é o mesmo
    if (hasChapter[0].lastChapter === mangaInfoData.sources.lastChapter) {
      return res.status(200).send("Registro já atualizado.");
    }

    //Atualiza a DB se o número do capítulo é diferente do cadastrado
    const filterSource = manga.sources.filter((i) => String(i.id) !== sourceId);
    await mangaModel.findByIdAndUpdate(manga._id, {
      sources: [mangaInfoData.sources, ...filterSource],
    });

    session.endSession();
    res.sendStatus(200);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    const err = error as AxiosError;
    if (err.response?.status === 404)
      return res.status(400).send("ID inválida!");
    res.status(500).send("Ops... Ocorreu um erro na sua requisição!");
  }
};

const getMangas = async (req: Request | any, res: Response) => {
  const { userEmail } = req;

  const session = await conn.startSession();

  try {
    session.startTransaction();

    //Procura e valida o usuário
    const user = await userModel.findOne({ email: userEmail });
    if (!user) return res.status(404).send("Usuário não encontrado");

    //Gera um objeto para cada item e source que o usuário segue
    const ids = user.following
      .map((i) => {
        if (i.sources.length > 1) {
          const listSources = i.sources.map((j) => {
            return { linkId: j.linkId, sourceId: j.id };
          });
          return { ...listSources };
        } else {
          return { linkId: i.sources[0].linkId, sourceId: i.sources[0].id };
        }
      })
      .flat();

    //Atualiza todos itens
    const newData = await Promise.all(
      ids.map((i) => {
        return getMangaData(i.linkId!, i.sourceId!);
      })
    );

    //Atualiza a BD
    await Promise.all(
      newData.map((i) =>
        mangaModel.updateOne(
          {
            _id: i.sources.mangaId,
            "sources.lastChapter": i.sources.chapter,
          },
          {
            $set: {
              "sources.$.lastChapter": i.sources.lastChapter,
              "sources.$.date": i.sources.date,
              "sources.$.scan": i.sources.scan,
            },
          }
        )
      )
    );

    const to2Digits = (num: number) => {
      return num.toString().padStart(2, "0");
    };

    const formatDate = (d: Date) => {
      return [
        to2Digits(d.getDate()),
        to2Digits(d.getMonth() + 1),
        d.getFullYear(),
      ].join("/");
    };

    //order
    const dataByDate = newData.sort(function (a, b) {
      return b.sources.date.getTime() - a.sources.date.getTime();
    });

    session.endSession();
    res.status(200).json(dataByDate);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).send("Ops... Ocorreu um erro na sua requisição!");
  }
};

export { getMangas, newManga, updateManga };
