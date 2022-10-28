import axios from "axios";
import { sourceModel } from "../models/SourceModel";
import * as cheerio from "cheerio";
import { ObjectId } from "mongoose";
import { mangaModel, IManga, ISource } from "../models/MangaModel";

interface Scanlator {
  name: string;
}

interface ScanInterface {
  scanlators: Scanlator[];
}

interface ReleasesInterface {
  [key: string]: ScanInterface;
}

interface MLInterface {
  id_serie: number;
  name: string;
  number: string;
  date: string;
  date_created: string;
  releases: ReleasesInterface;
}

interface MLResponse {
  chapters: MLInterface[];
}

// Busca pelos dados de um novo mangá
export const newMangaHelper = async (muPath: string, mlPath: string) => {
  //RESOLVER CASO DE MANGA SEM CAPITULO
  //EXEMPLO y11s57s

  const muSource = await sourceModel.findOne({ abb: "MU" });
  const mlSource = await sourceModel.findOne({ abb: "ML" });

  if (!muSource || !mlSource) throw Error();

  const muURL = muSource.createURL + muPath;
  const { data: muData } = await axios.get(muURL);
  const $mu = cheerio.load(muData);

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
  let muSourceData: ISource,
    mlSourceData: ISource,
    muChapter,
    muDate,
    muScan,
    finalSources: ISource[];

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
  const mlURL = mlSource.createURL + mlPath;
  const { data: mlData } = await axios.get(mlURL);
  const $ml = cheerio.load(mlData);

  const indexID = mlPath.indexOf("/");
  const pathID = mlPath.substring(indexID + 1);
  const updateU = mlSource.updateURL + pathID;

  const data: MLResponse = await axios.get(updateU).then((response) => {
    return response.data;
  });
  const lChapter = data.chapters[0];

  image = $ml(".cover").eq(1).prop("src");

  const date = lChapter.date_created;

  const mlChapter = lChapter.number;
  const releases = lChapter.releases;

  mlSourceData = {
    sourceID: mlSource._id,
    pathID: mlPath,
    chapter: mlChapter,
    date: new Date(date),
    scanlator: Object.values(releases)[0].scanlators[0].name,
  };

  if (mlSourceData.date >= muSourceData.date) {
    finalSources = [mlSourceData, muSourceData];
  } else {
    finalSources = [muSourceData, mlSourceData];
  }

  return {
    image,
    name,
    author,
    genres,
    sources: finalSources,
  };
};

// Atualiza os dados de um mangá especifico
export const updateMangaHelper = async (id: ObjectId) => {
  const manga = await mangaModel.findById(id);

  const muSource = await sourceModel.findOne({ abb: "MU" });
  const mlSource = await sourceModel.findOne({ abb: "ML" });

  if (!muSource || !mlSource) throw Error();

  const mu = manga!.sources.filter(
    (i) => String(i.sourceID) === String(muSource._id)
  );
  const ml = manga!.sources.filter(
    (i) => String(i.sourceID) === String(mlSource._id)
  );

  const muPath = mu.length > 0 ? mu[0].pathID : "";
  const mlPath = ml.length > 0 ? ml[0].pathID : "";

  const muURL = muSource.updateURL + muPath;
  const { data: muData } = await axios.get(muURL);
  const $mu = cheerio.load(muData);

  let name: string, author: string, genres: string[];

  genres = $mu(".col-6.p-2.text:eq(1) .sContent:eq(1) u")
    .map(function (index, item) {
      return $mu(item).text();
    })
    .get()
    .slice(0, -1);

  name = $mu(".releasestitle").text();

  if ($mu("a[href*='add_author']").length > 0) {
    const text = $mu("a[href*='add_author']:first").parents().first().text();
    author = text.replace("[Add]\n", "");
  } else {
    author = $mu("a[title='Author Info']").first().text();
  }

  //MangaUpdates
  let muSourceData: ISource,
    mlSourceData: ISource,
    muChapter,
    muDate,
    muScan,
    finalSources: ISource[];

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
  const mlURL = mlSource.createURL + mlPath;
  const { data: mlData } = await axios.get(mlURL);

  const indexID = mlPath.indexOf("/");
  const pathID = mlPath.substring(indexID + 1);
  const updateU = mlSource.updateURL + pathID;

  const data: MLResponse = await axios
    .get(updateU)
    .then((response) => {
      return response.data;
    })
    .catch((r) => {
      return {
        chapters: [
          {
            id_serie: 0,
            name: manga!.name,
            number: ml[0].chapter,
            date: "",
            date_created: ml[0].date,
            releases: {
              _scan: {
                scanlators: [{ name: ml[0].scanlator }],
              },
            },
          },
        ],
      };
    });
  const lChapter = data.chapters[0];

  const date = lChapter.date_created;
  const mlChapter = lChapter.number;
  const releases = lChapter.releases;

  mlSourceData = {
    sourceID: mlSource._id,
    pathID: mlPath,
    chapter: mlChapter,
    date: new Date(date),
    scanlator: Object.values(releases)[0].scanlators[0].name,
  };

  if (mlSourceData.date >= muSourceData.date) {
    finalSources = [mlSourceData, muSourceData];
  } else {
    finalSources = [muSourceData, mlSourceData];
  }

  return {
    id: manga!._id,
    image: manga!.image,
    name,
    author,
    genres,
    sources: finalSources,
  };
};

/*
// Atualiza os dados de mais de um mangá
export const updateManyHelper = async (ids: ObjectId[]) => {
  const muSource = await sourceModel.findOne({ abb: "MU" });
  const mlSource = await sourceModel.findOne({ abb: "ML" });
  if (!muSource || !mlSource) throw Error();

  return await Promise.all(
    ids.map(async (i) => {
      const manga = await mangaModel.findById(i);

      const mu = manga!.sources.filter(
        (i) => String(i.sourceID) === String(muSource._id)
      );
      const ml = manga!.sources.filter(
        (i) => String(i.sourceID) === String(mlSource._id)
      );
      const muPath = mu.length > 0 ? mu[0].pathID : "";
      const mlPath = ml.length > 0 ? ml[0].pathID : "";

      const muURL = muSource.baseURL + muPath;
      const { data: muData } = await axios.get(muURL);
      const $mu = cheerio.load(muData);

      //MangaUpdates
      let muSourceData: ISource,
        mlSourceData: ISource,
        muChapter,
        muDate,
        muScan,
        finalSources: ISource[];

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
      const mlURL = mlSource.baseURL + mlPath;
      const data: MLResponse = await axios
        .get(mlURL)
        .then((response) => {
          return response.data;
        })
        .catch((r) => {
          return {
            id_serie: 0,
            name: manga!.name,
            number: ml[0].chapter,
            date: "",
            date_created: ml[0].date,
            releases: {
              _scan: {
                scanlators: [{ name: ml[0].scanlator }],
              },
            },
          };
        });

      const lChapter = data.chapters[0];
      const date = lChapter.date_created;
      const mlChapter = lChapter.number;
      const releases = lChapter.releases;

      mlSourceData = {
        sourceID: mlSource._id,
        pathID: mlPath,
        chapter: mlChapter,
        date: new Date(date),
        scanlator: Object.values(releases)[0].scanlators[0].name,
      };

      if (mlSourceData.date >= muSourceData.date) {
        finalSources = [mlSourceData, muSourceData];
      } else {
        finalSources = [muSourceData, mlSourceData];
      }

      return { mangaID: i, sources: finalSources };
    })
  ).then((res) => {
    return res.filter((i) => i !== undefined);
  });
};
 */
