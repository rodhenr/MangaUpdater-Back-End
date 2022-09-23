import { model, Schema } from "mongoose";

const sources = new Schema({
  name: { type: String, required: true },
  id: { type: String, required: true },
});

const chapters = new Schema({
  number: { type: Number, required: true },
  scan: { type: String, required: true },
  date: { type: Date, required: true },
  source: { type: String, required: true },
});

const mangaSchema = new Schema({
  image: {
    data: Buffer,
    contentType: String,
  },
  name: { type: String, required: true },
  author: { type: String, required: true },
  chapters: { type: [chapters], required: true, default: [] },
  sources: { type: [sources], required: true },
});

const mangaModel = model("manga", mangaSchema);

export { mangaModel };
