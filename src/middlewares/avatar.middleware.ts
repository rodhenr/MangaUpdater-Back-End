import Multer, { diskStorage } from "multer";
import { GridFsStorage } from "multer-gridfs-storage/lib/gridfs";
import util from "util";
import dotenv from "dotenv";
dotenv.config();

const storage = new GridFsStorage({
  url: `${process.env.DATABASE_URL}`,
  options: { useNewUrlParser: true, useUnifiedTopology: true },

  file: (req, file) => {
    const match = ["image/png", "image/jpeg"];

    if (match.indexOf(file.mimetype) === -1)
      return `${Date.now()} ${file.originalname}`;

    return {
      bucketName: "images",
      filename: `${Date.now()} ${file.originalname}`,
    };
  },
});

const upload = Multer({ storage: storage }).single("file");

export { storage, upload };
