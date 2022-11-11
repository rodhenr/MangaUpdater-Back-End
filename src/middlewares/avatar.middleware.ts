import Multer, { diskStorage } from "multer";
import dotenv from "dotenv";
import path from "path";
dotenv.config();

var storage = diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../public/images"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = Multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(
        new Error("Apenas arquivos .png, .jpg e .jpeg são permitidos!")
      );
    }
  },
  limits: { fileSize: 1024 * 1024 },
});

export { upload };
