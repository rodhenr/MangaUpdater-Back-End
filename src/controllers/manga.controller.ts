import { mangaModel, ISource } from "../models/MangaModel";
import { conn } from "../config/connection";
import { Request, Response } from "express";
import { AxiosError } from "axios";
import {
  newMangaHelper,
  updateMangaHelper,
  updateManyHelper,
} from "../utils/mangaInfo";
import { isValidObjectId } from "mongoose";
import { userModel } from "../models/UserModel";

interface IManga {
  image: string;
  name: string;
  author: string;
  genres: string[];
  sources: ISource[];
}

// Cadastra um novo mangá no banco de dados
const newManga = async (req: Request, res: Response) => {
  const { muPathID, mlPathID } = req.body; //COLOCAR MLPATHID COMO OPCIONAL

  const session = await conn.startSession();

  try {
    session.startTransaction();

    const isNew = await mangaModel.findOne({
      sources: {
        $elemMatch: { pathID: muPathID },
      },
    });
    if (isNew) return res.status(400).send("ID já cadastrada!");

    if (mlPathID) {
      const newMangaData = await newMangaHelper(muPathID, mlPathID);
      await mangaModel.create(newMangaData);
    } else {
      const newMangaData = await newMangaHelper(muPathID);
      await mangaModel.create(newMangaData);
    }

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

    const updatedData: IManga = await updateMangaHelper(manga);
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

    const updatedData = await updateManyHelper(mangaIDs);
    await Promise.all(
      updatedData.map(
        async (i) =>
          await mangaModel.updateOne(
            {
              _id: i!.mangaID,
            },
            {
              $set: {
                sources: i!.sources,
              },
            }
          )
      )
    );

    const uData = await Promise.all(
      updatedData.map(async (i) => {
        const mData = await mangaModel.findById(i!.mangaID);

        const userSources = user.following.filter((i) => {
          return String(i.mangaID) === String(mData!._id);
        })[0].sources;

        const mSources = userSources.map((i) => {
          return mData?.sources.filter(
            (j) => String(j.sourceID) === String(i.sourceID)
          )[0];
        });

        return {
          mangaID: mData!._id,
          image: mData!.image,
          name: mData!.name,
          sources: mSources,
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

    const mangaSources = manga.sources.map((i) => {
      let filter;

      if (userSource.length === 0) {
        filter = [];
      } else {
        filter = userSource[0]?.sources.filter(
          (j) => String(j.sourceID) === String(i.sourceID)
        );
      }

      if (filter.length > 0) {
        return {
          sourceID: i.sourceID,
          pathID: i.pathID,
          chapter: i.chapter,
          date: i.date,
          scanlator: i.scanlator,
          follow: true,
        };
      } else {
        return {
          sourceID: i.sourceID,
          pathID: i.pathID,
          chapter: i.chapter,
          date: i.date,
          scanlator: i.scanlator,
          follow: false,
        };
      }
    });

    const data = {
      id: manga._id,
      name: manga.name,
      author: manga.author,
      genres: manga.genres,
      image: manga.image,
      sources: mangaSources,
    };

    res.status(200).json(data);
  } catch (error) {
    res.status(500).send("Ops... Ocorreu um erro na sua requisição!");
  }
};

export { getMangaModal, getMangas, newManga, updateManga };
