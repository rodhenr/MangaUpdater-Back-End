import { model, Schema, Types } from "mongoose";

export interface ISource {
  sourceID: Schema.Types.ObjectId;
  pathID: string;
  chapter: string;
  date: Date;
  scanlator: string;
}

export interface IManga {
  _id: Schema.Types.ObjectId;
  image: string;
  name: string;
  author: string;
  genres: string[];
  sources: ISource[];
}
export const sourcesSchema = new Schema<ISource>(
  {
    sourceID: { type: Types.ObjectId, required: true },
    pathID: { type: String, required: true },
    chapter: { type: String, required: true },
    date: { type: Date, required: true },
    scanlator: { type: String, required: true },
  },
  { _id: false }
);

const mangaSchema = new Schema<IManga>({
  image: { type: String, required: true },
  name: { type: String, required: true },
  author: { type: String, required: true },
  genres: { type: [String], required: true },
  sources: { type: [sourcesSchema], required: true, default: [] },
});

const mangaModel = model("manga", mangaSchema);

export { mangaModel };
