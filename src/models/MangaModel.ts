import { Document, model, Schema, Types } from "mongoose";

export interface ISource {
  id: Schema.Types.ObjectId;
  linkId: string;
}

interface IChapter {
  _id: Schema.Types.ObjectId;
  number: string;
  scan: string;
  date: Date;
  source: Schema.Types.ObjectId;
}

export interface IManga {
  _id: Schema.Types.ObjectId;
  image: string;
  name: string;
  author: string;
  chapters: Types.DocumentArray<IChapter & Document>;
  sources: ISource[];
}
export const sourcesSchema = new Schema<ISource>(
  {
    id: { type: Types.ObjectId, required: true },
    linkId: { type: String, required: true },
  },
  { _id: false }
);

const chaptersSchema = new Schema<IChapter>({
  number: { type: String, required: true },
  scan: { type: String, required: true },
  date: { type: Date, required: true },
  source: { type: Types.ObjectId, required: true },
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
