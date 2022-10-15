import axios from "axios";
import { sourceModel } from "../models/SourceModel";
import * as cheerio from "cheerio";
import { ObjectId } from "mongoose";
import { mangaModel } from "../models/MangaModel";

export const getMangaData = async (
  mdID: string,
  id: string,
  sourceId: string | ObjectId
) => {
  //RESOLVER CASO DE MANGA SEM CAPITULO
  //EXEMPLO y11s57s

  const sourceData = await sourceModel.findById(sourceId);
  const mangaInfo = await mangaModel.findOne({ mdID });
  if (!sourceData) throw Error();

  const urlSource = sourceData.baseURL + id;
  const urlMangaDex = `https://mangalivre.net/manga/overlord/1936`;
  const { data } = await axios.get(urlSource);
  const { data: dataMD } = await axios.get(urlMangaDex);
  console.log(dataMD);
  const $ = cheerio.load(data);
  const $md = cheerio.load(dataMD);

  let chapterNumber: string;
  if ($("div.sContent:contains('v.')").length > 0) {
    chapterNumber = $("div.sContent:contains('c.') i").eq(1).text();
  } else {
    chapterNumber = $("div.sContent:contains('c.') i").first().text();
  }
  const chapterScan = $('a[title="Group Info"]').first().text();
  const chapterDate = $(".sContent span").first().prop("title");

  const daysStr = " days";
  const regex = new RegExp("\\b" + daysStr + "\\b");
  const dateIndex = chapterDate.search(regex);
  const daysAgo = chapterDate.slice(0, dateIndex);
  const today = new Date();

  const realDate = new Date(today.getTime());
  realDate.setDate(today.getDate() - daysAgo);

  const sources = {
    mangaId: mangaInfo ? String(mangaInfo._id) : "",
    chapter: mangaInfo?.sources[0].lastChapter ?? "",
    id: sourceData._id,
    linkId: id,
    lastChapter: chapterNumber,
    scan: chapterScan,
    date: new Date(realDate),
  };
  const name = $(".releasestitle").text();
  console.log();
  const image = $md("img[data-v-46420996]").attr("src");
  console.log(image);
  let author;
  if ($("a[href*='add_author']").length > 0) {
    const text = $("a[href*='add_author']:first").parents().first().text();
    author = text.replace("[Add]\n", "");
  } else {
    author = $("a[title='Author Info']").first().text();
  }

  return {
    mdID,
    image,
    name,
    author,
    sources,
  };
};
