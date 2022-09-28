import { Document, model, Schema, Types } from "mongoose";

export interface ISource {
  name: string;
  id: string;
}

export interface IChapter {
  number: string;
  scan: string;
  date: Date;
  source: string;
}

export interface IManga {
  _id: string;
  image: string;
  name: string;
  author: string;
  chapters: Types.DocumentArray<IChapter & Document>;
  sources: Types.DocumentArray<ISource & Document>;
}
const sourcesSchema = new Schema<ISource>({
  name: { type: String, required: true },
  id: { type: String, required: true },
});

const chaptersSchema = new Schema<IChapter>({
  number: { type: String, required: true },
  scan: { type: String, required: true },
  date: { type: Date, required: true },
  source: { type: String, required: true },
});

const mangaSchema = new Schema<IManga>({
  image: { type: String, required: true },
  name: { type: String, required: true },
  author: { type: String, required: true },
  chapters: { type: [chaptersSchema], required: true, default: [] },
  sources: { type: [sourcesSchema], required: true, default: [] },
});

const mangaModel = model("manga", mangaSchema);

export { mangaModel };
