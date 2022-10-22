import axios from "axios";
import { sourceModel } from "../models/SourceModel";
import * as cheerio from "cheerio";
import { ObjectId } from "mongoose";
import { mangaModel, IManga, ISource } from "../models/MangaModel";

interface IUpdate {
  mangaID: ObjectId;
  sources: ISource;
}

//Recebe os pathIDs e busca os dados de um novo mangá
export const newMangaHelper = async (muPath: string, mlPath?: string) => {
  //RESOLVER CASO DE MANGA SEM CAPITULO
  //EXEMPLO y11s57s

  //Procura pelas sources na db
  const muSource = await sourceModel.findOne({ abb: "MU" });
  const mlSource = await sourceModel.findOne({ abb: "ML" });

  if (!muSource || !mlSource) throw Error();

  //Scrapping das sources
  const muURL = muSource.baseURL + muPath;

  const { data: muData } = await axios.get(muURL);

  const $mu = cheerio.load(muData);

  //Faz a aquisição dos dados básicos
  let image, name, author, genres;

  genres = $mu(".col-6.p-2.text:eq(1) .sContent:eq(1) u")
    .map(function (index, item) {
      return $mu(item).text();
    })
    .get()
    .slice(0, -1);
  name = $mu(".releasestitle").text();
  image = $mu(".sContent center img").prop("src");

  if ($mu("a[href*='add_author']").length > 0) {
    const text = $mu("a[href*='add_author']:first").parents().first().text();
    author = text.replace("[Add]\n", "");
  } else {
    author = $mu("a[title='Author Info']").first().text();
  }

  //MangaUpdates
  let muSourceData, muChapter, muDate, muScan;
  let mlSourceData = {};

  if ($mu("div.sContent:contains('v.')").length > 0) {
    muChapter = $mu("div.sContent:contains('c.') i").eq(1).text();
  } else {
    muChapter = $mu("div.sContent:contains('c.') i").first().text();
  }
  muScan = $mu('a[title="Group Info"]').first().text();
  muDate = $mu(".sContent span").first().prop("title");
  const daysStr = " days";
  const regex = new RegExp("\\b" + daysStr + "\\b");
  const dateIndex = muDate.search(regex);
  const daysAgo = muDate.slice(0, dateIndex);
  const today = new Date();
  const realDate = new Date(today.getTime());
  realDate.setDate(today.getDate() - daysAgo);

  muSourceData = {
    sourceID: muSource._id,
    pathID: muPath,
    chapter: muChapter,
    date: new Date(realDate),
    scanlator: muScan,
  };

  //MangaLivre
  if (mlPath) {
    const mlURL = mlSource.baseURL + mlPath;
    const { data: mlData } = await axios.get(mlURL);
    const $ml = cheerio.load(mlData);

    genres = $ml(".tags li span")
      .map(function (index, item) {
        return $ml(item).text();
      })
      .get();
    image = $ml(".cover").eq(1).prop("src");
    /*
    const date = $ml(".chapter-date").first().text();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const mlChapter = $ml(".cap-text").first().text(); // criar regex
    const mlScan = $ml(".scanlator-name a").first().text();
    const mlDate =
      date === "hoje" ? today : date === "ontem" ? yesterday : date;

    mlSourceData = {
      sourceID: mlSource._id,
      pathID: mlPath,
      chapter: mlChapter,
      date: new Date(mlDate),
      scanlator: mlScan,
    };
    */
  }

  //Cria o array de sources
  const finalSources =
    Object.keys(mlSourceData).length > 0
      ? [muSourceData, mlSourceData]
      : [muSourceData];

  return {
    image,
    name,
    author,
    genres,
    sources: finalSources,
  };
};

// Atualiza um mangá especifico
export const updateMangaHelper = async (manga: IManga) => {
  //Procura pelas sources na db
  const mangaSources = manga.sources;
  const muSource = await sourceModel.findOne({ abb: "MU" });
  const mlSource = await sourceModel.findOne({ abb: "ML" });

  if (!muSource || !mlSource) throw Error();

  //Busca as informações de pathID
  const mu = mangaSources.filter(
    (i) => String(i.sourceID) === String(muSource._id)
  );
  const ml = mangaSources.filter(
    (i) => String(i.sourceID) === String(mlSource._id)
  );

  const muPath = mu.length > 0 ? mu[0].pathID : "";
  const mlPath = ml.length > 0 ? ml[0].pathID : "";
  //Scrapping das sources
  const muURL = muSource.baseURL + muPath;

  const { data: muData } = await axios.get(muURL);

  const $mu = cheerio.load(muData);

  //Faz a aquisição dos dados básicos
  let image: string, name: string, author: string, genres: string[];

  genres = $mu(".col-6.p-2.text:eq(1) .sContent:eq(1) u")
    .map(function (index, item) {
      return $mu(item).text();
    })
    .get()
    .slice(0, -1);

  name = $mu(".releasestitle").text();
  image = $mu(".sContent center img").prop("src");

  if ($mu("a[href*='add_author']").length > 0) {
    const text = $mu("a[href*='add_author']:first").parents().first().text();
    author = text.replace("[Add]\n", "");
  } else {
    author = $mu("a[title='Author Info']").first().text();
  }

  //MangaUpdates
  let muSourceData: ISource, muChapter, muDate, muScan;
  let mlSourceData = {};

  if ($mu("div.sContent:contains('v.')").length > 0) {
    muChapter = $mu("div.sContent:contains('c.') i").eq(1).text();
  } else {
    muChapter = $mu("div.sContent:contains('c.') i").first().text();
  }
  muScan = $mu('a[title="Group Info"]').first().text();
  muDate = $mu(".sContent span").first().prop("title");
  const daysStr = " days";
  const regex = new RegExp("\\b" + daysStr + "\\b");
  const dateIndex = muDate.search(regex);
  const daysAgo = muDate.slice(0, dateIndex);
  const today = new Date();
  const realDate = new Date(today.getTime());
  realDate.setDate(today.getDate() - daysAgo);

  muSourceData = {
    sourceID: muSource._id,
    pathID: muPath,
    chapter: muChapter,
    date: new Date(realDate),
    scanlator: muScan,
  };

  //MangaLivre
  if (mlPath !== "") {
    const mlURL = mlSource.baseURL + mlPath;
    const { data: mlData } = await axios.get(mlURL);
    const $ml = cheerio.load(mlData);

    genres = $ml(".tags li span")
      .map(function (index, item) {
        return $ml(item).text();
      })
      .get();
    image = $ml(".cover").eq(1).prop("src");
    /*
    const date = $ml(".chapter-date").first().text();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const mlChapter = $ml(".cap-text").first().text(); // criar regex
    const mlScan = $ml(".scanlator-name a").first().text();
    const mlDate =
      date === "HOJE" ? today : date === "ONTEM" ? yesterday : date;

    mlSourceData = {
      sourceID: mlSource._id,
      pathID: mlPath,
      chapter: mlChapter,
      date: new Date(mlDate),
      scanlator: mlScan,
    };
    */
  }

  //Criar um filtro para colocar a última atualização em primeiro lugar

  //Cria o array de sources
  const finalSources = [muSourceData];
  /*const finalSources =
    Object.keys(mlSourceData).length > 0
      ? [muSourceData, mlSourceData]
      : [muSourceData];
  */

  return {
    image,
    name,
    author,
    genres,
    sources: finalSources,
  };
};

//Atualiza um lote de IDs
export const updateManyHelper = async (ids: ObjectId[]) => {
  //Para cada ID é gerado um objeto {mangaID, Sources} que será usado
  //para atualizar a DB
  const muSource = await sourceModel.findOne({ abb: "MU" });
  const mlSource = await sourceModel.findOne({ abb: "ML" });
  if (!muSource || !mlSource) throw Error();

  return await Promise.all(
    ids.map(async (i) => {
      const manga = await mangaModel.findById(i);

      //Busca as informações de pathID
      const mu = manga!.sources.filter(
        (i) => String(i.sourceID) === String(muSource._id)
      );
      const ml = manga!.sources.filter(
        (i) => String(i.sourceID) === String(mlSource._id)
      );
      const muPath = mu.length > 0 ? mu[0].pathID : "";
      const mlPath = ml.length > 0 ? ml[0].pathID : "";

      //Scrapping das sources
      const muURL = muSource.baseURL + muPath;

      const { data: muData } = await axios.get(muURL);

      const $mu = cheerio.load(muData);

      //MangaUpdates
      let muSourceData: ISource, muChapter, muDate, muScan, image;
      //let mlSourceData: ISource;

      image = $mu(".sContent center img").prop("src");

      if ($mu("div.sContent:contains('v.')").length > 0) {
        muChapter = $mu("div.sContent:contains('c.') i").eq(1).text();
      } else {
        muChapter = $mu("div.sContent:contains('c.') i").first().text();
      }
      muScan = $mu('a[title="Group Info"]').first().text();
      muDate = $mu(".sContent span").first().prop("title");
      const daysStr = " days";
      const regex = new RegExp("\\b" + daysStr + "\\b");
      const dateIndex = muDate.search(regex);
      const daysAgo = muDate.slice(0, dateIndex);
      const today = new Date();
      const realDate = new Date(today.getTime());
      realDate.setDate(today.getDate() - daysAgo);

      muSourceData = {
        sourceID: muSource._id,
        pathID: muPath,
        chapter: muChapter,
        date: new Date(realDate),
        scanlator: muScan,
      };

      //MangaLivre
      if (mlPath !== "") {
        const mlURL = mlSource.baseURL + mlPath;
        const { data: mlData } = await axios.get(mlURL);
        const $ml = cheerio.load(mlData);

        image = $ml(".cover").eq(1).prop("src");
        /*
      const date = $ml(".chapter-date").first().text();
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const mlChapter = $ml(".cap-text").first().text(); // criar regex
      const mlScan = $ml(".scanlator-name a").first().text();
      const mlDate =
        date === "HOJE" ? today : date === "ONTEM" ? yesterday : date;

      mlSourceData = {
        sourceID: mlSource._id,
        pathID: mlPath,
        chapter: mlChapter,
        date: new Date(mlDate),
        scanlator: mlScan,
      };
      */
      }

      //Cria o array de sources
      /*const finalSources =
        Object.keys(mlSourceData).length > 0
          ? [muSourceData, mlSourceData]
          : [muSourceData];
      */
     
      //Criar um filtro para colocar a última atualização em primeiro lugar
      const finalSources = [muSourceData];
      return { mangaID: i, sources: finalSources };
    })
  ).then((res) => {
    return res.filter((i) => i !== undefined);
  });
};
