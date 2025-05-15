import fs from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import logger from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const accessLogPath = join(__dirname, "../logs/access.log");

export function initializeLogFile() {
  try {
    fs.writeFileSync(accessLogPath, "");
    console.log("✅ access.log cleared on server start");
  } catch (err) {
    console.error("❌ Failed to clear access.log:", err);
  }
}

export function logRequests(req, res, next) {
  if (req.headers["x-health-check"] === "true") {
    return next();
  }

  const userIP =
    req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown IP";

  logger.info(`Access from ${userIP} - ${req.method} ${req.originalUrl}`);
  next();
}