import multer from "multer";
import { join } from "path";
import fs from "fs";

const uploadDir = join("upload");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const capsuleId = req.params.id;
    const capsuleUploadDir = join(uploadDir, capsuleId.toString());

    if (!fs.existsSync(capsuleUploadDir)) {
      fs.mkdirSync(capsuleUploadDir, { recursive: true });
    }

    cb(null, capsuleUploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 1024 * 3 },
});