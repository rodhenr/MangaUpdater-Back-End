import { model, Schema } from "mongoose";

interface ILastRead {
  chapter: string;
  source: string;
}

interface IFollowing {
  mangaId: Schema.Types.ObjectId;
  image: Buffer;
  name: string;
  author: string;
  lastRead: ILastRead[];
}

const lastRead = new Schema<ILastRead>(
  {
    chapter: { type: String, required: true },
    source: { type: String, required: true },
  },
  { _id: false }
);

const followingSchema = new Schema<IFollowing>(
  {
    mangaId: { type: Schema.Types.ObjectId, required: true },
    lastRead: { type: [lastRead], required: true, default: [] },
  },
  { _id: false }
);

const userSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  avatar: { data: Buffer, contentType: String },
  following: { type: [followingSchema], required: true, default: [] },
});

const userModel = model("user", userSchema);

export { userModel };
