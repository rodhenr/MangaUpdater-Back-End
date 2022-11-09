import Multer, { diskStorage } from "multer";
import dotenv from "dotenv";
import path from "path";
dotenv.config();

var storage = diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = Multer({ storage: storage });

export { upload };
