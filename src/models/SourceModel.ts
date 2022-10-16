import { model, Schema } from "mongoose";

interface ISource {
  _id: Schema.Types.ObjectId;
  name: string;
  abb: string;
  baseURL: string;
  language: string;
}
const sourceSchema = new Schema<ISource>({
  name: { type: String, required: true },
  abb: { type: String, required: true },
  baseURL: { type: String, required: true },
  language: { type: String, required: true },
});

const sourceModel = model("source", sourceSchema);

export { sourceModel };
