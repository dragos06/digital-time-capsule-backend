import express from "express";
import { generateCapsules } from "../controllers/generateController.js";
const router = express.Router();

router.post("/generate", generateCapsules);

export default router;
