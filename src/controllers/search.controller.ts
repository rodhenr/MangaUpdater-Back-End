import { mangaModel } from "../models/MangaModel";
import { userModel, IFollowing } from "../models/UserModel";
import { Request, Response } from "express";
import { AxiosError } from "axios";
import { conn } from "../config/connection";
import { isValidObjectId } from "mongoose";
import { sourceModel } from "../models/SourceModel";

const getSearch = async (req: Request, res: Response) => {
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

export { getSearch };
