import { mangaModel } from "../models/MangaModel";
import { conn } from "../config/connection";
import { Request, Response } from "express";
import { AxiosError } from "axios";
import { newMangaHelper, updateMangaHelper } from "../utils/mangaInfo";
import { isValidObjectId } from "mongoose";
import { userModel } from "../models/UserModel";
import { sourceModel } from "../models/SourceModel";

// Cadastra um novo mangá no banco de dados
const newManga = async (req: Request | any, res: Response) => {
  const { muPathID, mlPathID } = req.body;
  const { userEmail } = req;

  const session = await conn.startSession();

  try {
    session.startTransaction();
    const user = await userModel.findOne({ email: userEmail });

    if (user === null || !user.admin)
      return res.status(400).send("Você não tem permissão de cadastro.");

    const isNew = await mangaModel.findOne({
      sources: {
        $elemMatch: { pathID: muPathID },
      },
    });
    if (isNew) return res.status(400).send("ID já cadastrada!");

    const newMangaData = await newMangaHelper(muPathID, mlPathID);
    await mangaModel.create(newMangaData);

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

// Atualiza um único mangá
const updateManga = async (req: Request, res: Response) => {
  const { mangaID } = req.body;

  const session = await conn.startSession();

  try {
    session.startTransaction();

    const obj = isValidObjectId(mangaID);
    if (!obj) return res.status(400).send("ID inválida.");

    const manga = await mangaModel.findById(mangaID);
    if (!manga) return res.status(400).send("Mangá não encontrado.");

    const updatedData = await updateMangaHelper(manga._id);
    await mangaModel.findByIdAndUpdate({ _id: mangaID }, updatedData);

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

// Atualiza e lista os mangás que um determinado usuário segue
const getMangas = async (req: Request | any, res: Response) => {
  const { userEmail } = req;

  const session = await conn.startSession();

  try {
    session.startTransaction();

    const user = await userModel.findOne({ email: userEmail });
    if (!user) return res.status(404).send("Usuário não encontrado");

    const mangaIDs = user.following
      .map((i) => {
        return i.mangaID;
      })
      .flat();

    const updatedData = await Promise.all(
      mangaIDs.map(async (i) => {
        return updateMangaHelper(i);
      })
    ).then((res) => {
      return res.filter((i) => i !== undefined);
    });

    const uData = await Promise.all(
      updatedData.map(async (i) => {
        const mangaData = await mangaModel.findById(i!.id);

        const userSources = user.following.filter((i) => {
          return String(i.mangaID) === String(mangaData!._id);
        })[0].sources;

        const sourceResult = userSources.map((i) => {
          return mangaData?.sources.filter(
            (j) => String(j.sourceID) === String(i.sourceID)
          )[0];
        });

        const sortedSources = sourceResult.sort(function (a, b) {
          return b!.date.getTime() - a!.date.getTime();
        });

        return {
          mangaID: mangaData!._id,
          image: mangaData!.image,
          name: mangaData!.name,
          sources: sortedSources,
        };
      })
    );

    const dataByDate = uData.sort(function (a, b) {
      return b.sources[0]!.date.getTime() - a.sources[0]!.date.getTime();
    });

    session.endSession();
    res.status(200).json(dataByDate);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).send("Ops... Ocorreu um erro na sua requisição!");
  }
};

// Lista as informações de um mangá para o usuário
const getMangaModal = async (req: Request | any, res: Response) => {
  const { mangaID } = req.query;
  const { userEmail } = req;

  try {
    const manga = await mangaModel.findById(mangaID);
    if (!manga) return res.status(400).send("Não encontrado.");

    const user = await userModel.findOne({ email: userEmail });
    if (!user) return res.status(404).send("Usuário não encontrado");

    const userSource = user.following.filter(
      (i) => String(i.mangaID) === mangaID
    );

    const mangaSources = await Promise.all(
      manga.sources.map(async (i) => {
        if (i.chapter === "N/A" || i.scanlator === "N/A") {
          return {};
        }

        let filter;

        if (userSource.length === 0) {
          filter = [];
        } else {
          filter = userSource[0]?.sources.filter(
            (j) => String(j.sourceID) === String(i.sourceID)
          );
        }

        const sourceName = await sourceModel.findById(i.sourceID);

        if (filter.length > 0) {
          return {
            sourceID: i.sourceID,
            pathID: i.pathID,
            chapter: i.chapter,
            date: i.date,
            scanlator: i.scanlator,
            follow: true,
            sourceName: sourceName!.name,
          };
        } else {
          return {
            sourceID: i.sourceID,
            pathID: i.pathID,
            chapter: i.chapter,
            date: i.date,
            scanlator: i.scanlator,
            follow: false,
            sourceName: sourceName!.name,
          };
        }
      })
    );

    const data = {
      id: manga._id,
      name: manga.name,
      alternativeNames: manga.alternativeNames,
      author: manga.author,
      genres: manga.genres,
      image: manga.image,
      sources: mangaSources.filter((i) => i.sourceID),
    };

    res.status(200).json(data);
  } catch (error) {
    res.status(500).send("Ops... Ocorreu um erro na sua requisição!");
  }
};

export { getMangaModal, getMangas, newManga, updateManga };
