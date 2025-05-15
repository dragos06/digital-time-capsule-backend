import fs from "fs";
import { join } from "path";
import archiver from "archiver";
import pool from "../db/pool.js";

function createZipArchive(capsuleId, res) {
  const uploadDir = join("upload", capsuleId.toString());
  if (!fs.existsSync(uploadDir)) {
    return res.status(404).json({ error: "Capsule not found" });
  }

  const archive = archiver("zip", { zlib: { level: 9 } });
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename=capsule-${capsuleId}.zip`);

  archive.pipe(res);

  fs.readdirSync(uploadDir).forEach((file) => {
    const filePath = join(uploadDir, file);
    if (fs.statSync(filePath).isFile()) {
      archive.file(filePath, { name: file });
    }
  });

  archive.finalize();
}

function uploadFiles(capsuleId, files) {
  const fileInfos = [];

  for (const file of files) {
    const filePath = `${process.env.NEXT_PUBLIC_API_BASE_URL}/upload/${capsuleId}/${file.filename}`;
    const fileName = file.originalname;
    const fileType = file.mimetype;
    const fileSize = file.size;

    pool.query(
      `INSERT INTO memories (capsule_id, file_name, file_path, file_type, file_size)
       VALUES ($1, $2, $3, $4, $5)`,
      [capsuleId, fileName, filePath, fileType, fileSize]
    );

    fileInfos.push({ fileName, filePath, fileType, fileSize });
  }

  return fileInfos;
}

export { createZipArchive, uploadFiles };