import { mangaModel, ISource } from "../models/MangaModel";
import { conn } from "../config/connection";
import { Request, Response } from "express";
import { AxiosError } from "axios";
import {
  newMangaHelper,
  updateMangaHelper,
  updateManyHelper,
} from "../utils/mangaInfo";
import { isValidObjectId, ObjectId } from "mongoose";
import { userModel } from "../models/UserModel";

interface IUpdate {
  mangaID: ObjectId;
  sources: ISource;
}

// Cadastro de novo mangá, é necessário informar o pathID do MangaUpdates e opcionalmente o pathID do MangaLivre
const newManga = async (req: Request, res: Response) => {
  const { muPathID, mlPathID } = req.body; //COLOCAR MLPATHID COMO OPCIONAL

  const session = await conn.startSession();

  try {
    session.startTransaction();

    //Verifica se já existe na DB
    const isNew = await mangaModel.findOne({
      sources: {
        $elemMatch: { pathID: muPathID },
      },
    });
    if (isNew) return res.status(400).send("ID já cadastrada!");

    // Cadastra o novo item na DB
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

//Atualiza um mangá em específico
const updateManga = async (req: Request, res: Response) => {
  const { mangaID } = req.body;

  const session = await conn.startSession();

  try {
    session.startTransaction();

    //Verifica se o ID é válido
    const obj = isValidObjectId(mangaID);
    if (!obj) return res.status(400).send("ID inválida.");

    //Verifica se já existe na DB
    const manga = await mangaModel.findById(mangaID);
    if (!manga) return res.status(400).send("Mangá não encontrado.");

    //Busca os dados
    const updatedData = await updateMangaHelper(manga);

    //Atualiza o mangá na DB
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

//Recebe a lista de mangás que um usuário em específico está seguindo
const getMangas = async (req: Request | any, res: Response) => {
  const { userEmail } = req;

  const session = await conn.startSession();

  try {
    session.startTransaction();

    //Procura e valida o usuário
    const user = await userModel.findOne({ email: userEmail });
    if (!user) return res.status(404).send("Usuário não encontrado");

    //Gera um objeto para cada item e source que o usuário segue
    const mangaIDs = user.following
      .map((i) => {
        return i.mangaID;
      })
      .flat();

    //Atualiza todos itens
    const updatedData = await updateManyHelper(mangaIDs);

    //Atualiza a BD
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

    //Faz uma nova query para pegar os dados atualizados
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

    //Ordena os dados por data
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
        filter = []
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
    console.log(error);
    res.status(500).send("Ops... Ocorreu um erro na sua requisição!");
  }
};

export { getMangaModal, getMangas, newManga, updateManga };
