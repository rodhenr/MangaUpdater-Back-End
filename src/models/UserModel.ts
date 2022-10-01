import { model, Schema } from "mongoose";
import { ISource, sourcesSchema } from "./MangaModel";

export interface IFollowing {
  mangaId: Schema.Types.ObjectId;
  sources: ISource[];
}

interface IUser {
  _id: Schema.Types.ObjectId;
  username: string;
  password: string;
  email: string;
  avatar: string;
  following: IFollowing[];
}

const followingSchema = new Schema<IFollowing>(
  {
    mangaId: { type: Schema.Types.ObjectId, required: true },
    sources: { type: [sourcesSchema], required: true, default: [] },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  avatar: { data: Buffer, contentType: String, default: "" },
  following: { type: [followingSchema], required: true, default: [] },
});

const userModel = model("user", userSchema);

export { userModel };
