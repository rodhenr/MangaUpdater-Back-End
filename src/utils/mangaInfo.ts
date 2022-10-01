import axios from "axios";
import { sourceModel } from "../models/SourceModel";
import * as cheerio from "cheerio";
import { ObjectId } from "mongoose";

export const searchInfo = async (id: string, sourceId: string | ObjectId) => {
  const sourceData = await sourceModel.findById(sourceId);

  if (!sourceData) throw Error();

  if (sourceData.name === "MU") {
    //MangaUpdate(www.mangaupdates.com)
    //Tratar add (e.g. dmnckia)
    //Tratar if(author === "")
    //https://www.mangaupdates.com/series/${id}`;
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

    const chapter = {
      number: chapterNumber,
      scan: chapterScan,
      date: new Date(formatDate(realDate)),
      source: sourceData._id,
    };

    const sources = [{ id: sourceData._id, linkId: id }];
    const name = $(".releasestitle").text();
    const image = $(".sContent center img").prop("src");
    let author = $("a[title='Author Info']").first().text();

    return {
      image,
      name,
      author,
      chapter,
      sources,
    };
  } else {
    return { image: "", name: "", author: "", chapter: [], sources: [] };
  }
};
