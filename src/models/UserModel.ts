import { model, Schema } from "mongoose";

// É possível ler de várias sources (mangadex/mangaupdates por exemplo)

const lastRead = new Schema(
  {
    id: { type: Schema.Types.ObjectId, required: true },
    chapter: { type: Number, required: true },
    source: { type: String, required: true },
  },
  { _id: false }
);

const followingSchema = new Schema(
  {
    id: { type: Schema.Types.ObjectId, required: true },
    image: {
      data: Buffer,
      contentType: String,
    },
    name: { type: String, required: true },
    author: { type: String, required: true },
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
