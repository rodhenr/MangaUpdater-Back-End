import { Document, model, Schema, Types } from "mongoose";

interface ISource {
  name: string;
  linkId: string;
}

interface IChapter {
  number: string;
  scan: string;
  date: Date;
  source: string;
}

export interface IManga {
  _id: Schema.Types.ObjectId;
  image: string;
  name: string;
  author: string;
  chapters: Types.DocumentArray<IChapter & Document>;
  sources: Types.DocumentArray<ISource & Document>;
}
const sourcesSchema = new Schema<ISource>(
  {
    name: { type: String, required: true },
    linkId: { type: String, required: true },
  },
  { _id: false }
);

const chaptersSchema = new Schema<IChapter>(
  {
    number: { type: String, required: true },
    scan: { type: String, required: true },
    date: { type: Date, required: true },
    source: { type: String, required: true },
  },
  { _id: false }
);

const mangaSchema = new Schema<IManga>({
  image: { type: String, required: true },
  name: { type: String, required: true },
  author: { type: String, required: true },
  chapters: { type: [chaptersSchema], required: true, default: [] },
  sources: { type: [sourcesSchema], required: true, default: [] },
});

const mangaModel = model("manga", mangaSchema);

export { mangaModel };
