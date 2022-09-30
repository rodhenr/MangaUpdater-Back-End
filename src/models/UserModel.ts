import { model, Schema } from "mongoose";

interface ILastRead {
  chapter: string;
  source: string;
}

interface IFollowing {
  mangaId: Schema.Types.ObjectId;
  lastRead: ILastRead[];
}

interface IUser {
  _id: Schema.Types.ObjectId;
  username: string;
  password: string;
  email: string;
  avatar: string;
  following: IFollowing[];
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

const userSchema = new Schema<IUser>({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  avatar: { data: String, contentType: String },
  following: { type: [followingSchema], required: true, default: [] },
});

const userModel = model("user", userSchema);

export { userModel };
