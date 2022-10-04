import axios from "axios";
import { sourceModel } from "../models/SourceModel";
import * as cheerio from "cheerio";
import { ObjectId } from "mongoose";
import { mangaModel } from "../models/MangaModel";

export const getMangaData = async (id: string, sourceId: string | ObjectId) => {
  const sourceData = await sourceModel.findById(sourceId);
  const mangaInfo = await mangaModel.findOne({
    sources: {
      $elemMatch: { linkId: id, id: sourceId },
    },
  });
  if (!sourceData) throw Error();

  const url = sourceData.baseURL + id;
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

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

  const sources = {
    mangaId: mangaInfo ? String(mangaInfo._id) : "",
    chapter: mangaInfo?.sources[0].lastChapter ?? "",
    id: sourceData._id,
    linkId: id,
    lastChapter: chapterNumber,
    scan: chapterScan,
    date: new Date(formatDate(realDate)),
  };
  const name = $(".releasestitle").text();
  const image = $(".sContent center img").prop("src");
  let author;
  if ($("a[href*='add_author']").length > 0) {
    const text = $("a[href*='add_author']:first").parents().first().text();
    author = text.replace("[Add]\n", "");
  } else {
    author = $("a[title='Author Info']").first().text();
  }

  return {
    image,
    name,
    author,
    sources,
  };
};
