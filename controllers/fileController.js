import fs from "fs";
import { join } from "path";
import archiver from "archiver";
import pool from "../db/pool.js";

export async function uploadFiles(req, res) {
  const capsuleId = parseInt(req.params.id);

  const capsuleCheck = await pool.query(
    "SELECT * FROM time_capsules WHERE capsule_id = $1",
    [capsuleId]
  );

  if (capsuleCheck.rows.length === 0) {
    return res.status(404).json({ error: "Capsule not found" });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  const fileInfos = [];

  for (const file of req.files) {
    const filePath = `${process.env.NEXT_PUBLIC_API_BASE_URL}/upload/${capsuleId}/${file.filename}`;
    const fileName = file.originalname;
    const fileType = file.mimetype;
    const fileSize = file.size;

    await pool.query(
      `INSERT INTO memories (capsule_id, file_name, file_path, file_type, file_size)
       VALUES ($1, $2, $3, $4, $5)`,
      [capsuleId, fileName, filePath, fileType, fileSize]
    );

    fileInfos.push({ fileName, filePath, fileType, fileSize });
  }

  res.status(201).json({
    message: "Files uploaded and metadata saved successfully",
    files: fileInfos,
  });
}

export function downloadCapsule(req, res) {
  const capsuleId = req.params.id;
  const capsuleUploadDir = join("upload", capsuleId.toString());

  if (!fs.existsSync(capsuleUploadDir)) {
    return res.status(404).json({ error: "Capsule not found" });
  }

  const archive = archiver("zip", { zlib: { level: 9 } });

  res.setHeader("Content-Type", "application/zip");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=capsule-${capsuleId}.zip`
  );

  archive.pipe(res);

  fs.readdirSync(capsuleUploadDir).forEach((file) => {
    const filePath = join(capsuleUploadDir, file);
    if (fs.statSync(filePath).isFile()) {
      archive.file(filePath, { name: file });
    }
  });

  archive.finalize();
}