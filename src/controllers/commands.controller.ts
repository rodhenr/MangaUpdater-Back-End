import { mangaModel } from "../models/MangaModel";
import { conn } from "../config/connection";
import { Request, Response } from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import dotenv from "dotenv";

dotenv.config();

const newRegister = async (req: Request, res: Response) => {
  if (!req.body.id) return res.status(400).send("ID inválido!");
  const { id } = req.body;

  const session = await conn.startSession();
  try {
    session.startTransaction();
    const isNew = await mangaModel.findOne({
      sources: {
        $elemMatch: { id: id },
      },
    });

    if (isNew) return res.status(400).send("ID já cadastrada!");

    const url = `https://www.mangaupdates.com/series/${id}`;

    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    //VERIFICAR SE É INVÁLIDO

    const sources = [{ name: "MU", id }];
    const name = $(".releasestitle").text();
    const image = $(".sContent center img").prop("src");
    const author = $("a[title='Author Info']").first().text();

    const chapterNumber = $("div.sContent:contains('c.') i").first().text();
    const chapterScan = $('a[title="Group Info"]').first().text();
    const chapterDate = $(".sContent span").first().prop("title");

    const daysStr = " days";
    const regex = new RegExp("\\b" + daysStr + "\\b");
    const dateIndex = chapterDate.search(regex);
    const daysAgo = chapterDate.slice(0, dateIndex);
    const today = new Date();

    const realDate = new Date(today.getTime());
    realDate.setDate(today.getDate() - daysAgo);

    function padTo2Digits(num: Number) {
      return num.toString().padStart(2, "0");
    }

    function formatDate(date: Date) {
      return [
        date.getFullYear(),
        padTo2Digits(date.getMonth() + 1),
        padTo2Digits(date.getDate()),
      ].join("-");
    }

    const chapters = [
      {
        number: chapterNumber,
        scan: chapterScan,
        date: new Date(formatDate(realDate)),
        source: "MU",
      },
    ];

    const mangaData = {
      image,
      name,
      author,
      chapters,
      sources,
    };

    console.log(mangaData);

    await mangaModel.create(mangaData);

    res.status(200).send("Registro criado com sucesso!");
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).send("Ops... Ocorreu um erro na sua requisição!");
  }
};

export { newRegister };
