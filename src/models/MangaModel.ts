import { Document, model, Schema, Types } from "mongoose";

export interface ISource {
  id: Schema.Types.ObjectId;
  linkId: string;
  lastChapter: string;
  scan: string;
  date: Date;
}

export interface IManga {
  _id: Schema.Types.ObjectId;
  image: string;
  name: string;
  author: string;
  sources: ISource[];
}
export const sourcesSchema = new Schema<ISource>(
  {
    id: { type: Types.ObjectId, required: true },
    linkId: { type: String, required: true },
    lastChapter: { type: String, required: true },
    scan: { type: String, required: true },
    date: { type: Date, required: true },
  },
  { _id: false }
);

const mangaSchema = new Schema<IManga>({
  image: { type: String, required: true },
  name: { type: String, required: true },
  author: { type: String, required: true },
  sources: { type: [sourcesSchema], required: true, default: [] },
});

const mangaModel = model("manga", mangaSchema);

export { mangaModel };
