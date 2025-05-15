import express from "express";
import cors from "cors";
import { join } from "path";
import http from "http";
import capsuleRoutes from "./routes/capsuleRoutes.js";
import registerRoutes from "./routes/registerRoutes.js";
import loginRoutes from "./routes/loginRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import generateRoutes from "./routes/generateRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import {
  logRequests,
  initializeLogFile,
} from "./middlewares/logRequests.js";
import { initSocket } from "./services/socketService.js";
import { monitorUserActivity } from "./utils/monitorUserActivity.js";

const MONITOR_INTERVAL = 1 * 60 * 1000;

const app = express();
const server = http.createServer(app);
const PORT = 5000;

app.use(cors());
app.use(express.json({ limit: "3gb" }));
app.use(express.urlencoded({ limit: "3gb", extended: true }));

app.use(function (req, res, next) {
  res.setTimeout(60 * 60 * 1000);
  next();
});

app.get("/", (req, res) => {
  res.redirect("/capsules?limit=99");
});

initializeLogFile();
app.use(logRequests);

app.use("/capsules", capsuleRoutes);
app.use("/capsules", generateRoutes);
app.use("/capsules", fileRoutes);
app.use("/upload", express.static(join("upload")));

app.use("/auth", registerRoutes);
app.use("/auth", loginRoutes);
app.use("/admin", adminRoutes);

setInterval(() => {
  monitorUserActivity();
  console.log("Checking user activity...");
}, MONITOR_INTERVAL);

if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, () =>
    console.log(`Server running on ${process.env.NEXT_PUBLIC_API_BASE_URL}`)
  );
}

initSocket(server);

export default app;
