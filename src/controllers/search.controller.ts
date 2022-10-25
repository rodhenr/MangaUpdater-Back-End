import { mangaModel } from "../models/MangaModel";
import { Request, Response } from "express";
import { AxiosError } from "axios";

// Pesquisa por mangás
const getSearch = async (req: Request, res: Response) => {
  const { word } = req.query;

  try {
    const manga = await mangaModel.find({
      name: { $regex: word, $options: "i" },
    });

    if (manga === null || !manga || manga.length === 0)
      return res.status(200).json([]);

    const mangaData = manga.map((i) => {
      return {
        id: i._id,
        name: i.name,
        image: i.image,
        source: i.sources,
      };
    });

    res.status(200).json(mangaData);
  } catch (error) {
    const err = error as AxiosError;
    res.status(500).send("Ops... Ocorreu um erro na sua requisição!");
  }
};

export { getSearch };
