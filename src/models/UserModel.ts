import { model, Schema, Types } from "mongoose";

export interface ISource {
  sourceID: Schema.Types.ObjectId;
  pathID: string;
}

export interface IFollowing {
  mangaID: Schema.Types.ObjectId;
  sources: ISource[];
}

export interface IUserConfig {
  avatar: string;
  language: string;
}

interface IUser {
  _id: Schema.Types.ObjectId;
  username: string;
  password: string;
  email: string;
  admin: boolean;
  config: IUserConfig;
  following: IFollowing[];
}

export const sourcesSchema = new Schema<ISource>(
  {
    sourceID: { type: Types.ObjectId, required: true },
    pathID: { type: String, required: true },
  },
  { _id: false }
);

const followingSchema = new Schema<IFollowing>(
  {
    mangaID: { type: Schema.Types.ObjectId, required: true },
    sources: { type: [sourcesSchema], required: true, default: [] },
  },
  { _id: false }
);

const userConfigSchema = new Schema<IUserConfig>(
  {
    avatar: { type: String, default: "" },
    language: { type: String, required: true },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  config: { type: userConfigSchema, required: true },
  admin: { type: Boolean, required: true, default: false },
  following: { type: [followingSchema], required: true, default: [] },
});

const userModel = model("user", userSchema);

export { userModel };
