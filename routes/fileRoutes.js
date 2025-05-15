import express from "express";
import { upload } from "../middlewares/multerConfig.js";
import { uploadFiles, downloadCapsule } from "../controllers/fileController.js";

const router = express.Router();

router.post("/:id/upload", upload.array("file", 100), uploadFiles);
router.get("/:id/download", downloadCapsule);

export default router;