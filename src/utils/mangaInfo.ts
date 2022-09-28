import axios from "axios";
import * as cheerio from "cheerio";

export const searchInfo = async (id: string, isNew: boolean) => {
  const url = `https://www.mangaupdates.com/series/${id}`;

  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

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

  if (isNew) {
    const sources = [{ name: "MU", id }];
    const name = $(".releasestitle").text();
    const image = $(".sContent center img").prop("src");
    let author = $("a[title='Author Info']").first().text();

    //Tratar caso com add (e.g. dmnckia)
    //if(author === "") 

    return {
      image,
      name,
      author,
      chapters,
      sources,
    };
  } else {
    return { chapters };
  }
};
