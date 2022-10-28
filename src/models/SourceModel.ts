import { model, Schema } from "mongoose";

interface ISource {
  _id: Schema.Types.ObjectId;
  name: string;
  abb: string;
  createURL: string;
  updateURL: string;
  language: string;
}
const sourceSchema = new Schema<ISource>({
  name: { type: String, required: true },
  abb: { type: String, required: true },
  createURL: { type: String, required: true },
  updateURL: { type: String, required: true },
  language: { type: String, required: true },
});

const sourceModel = model("source", sourceSchema);

export { sourceModel };
