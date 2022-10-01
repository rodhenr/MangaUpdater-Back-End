import { model, Schema } from "mongoose";

interface ISource {
  _id: Schema.Types.ObjectId;
  name: string;
  baseURL: string;
}
const sourceSchema = new Schema<ISource>(
  {
    name: { type: String, required: true },
    baseURL: { type: String, required: true },
  },
);

const sourceModel = model("source", sourceSchema);

export { sourceModel };