import { Server } from "socket.io";
import pool from "../db/pool.js";

function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: "*" },
    methods: ["GET", "POST"],
  });

  io.on("connection", async (socket) => {
    const ip = socket.handshake.headers["x-forwarded-for"] || socket.handshake.address;
    console.log(`New client connected: ${socket.id} | IP: ${ip}`);

    // Fetch stats and emit to client
    const stats = await getCapsuleStats();
    socket.emit("capsuleStats", stats);

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id} | IP: ${ip}`);
    });
  });

  return io;
}

async function getCapsuleStats() {
  return pool.query(`
    SELECT capsule_status, COUNT(*) AS count
    FROM time_capsules
    GROUP BY capsule_status
  `)
    .then(result => {
      const stats = { locked: 0, unlocked: 0 };
      result.rows.forEach((row) => {
        if (row.capsule_status === "Locked") stats.locked += parseInt(row.count);
        if (row.capsule_status === "Unlocked") stats.unlocked += parseInt(row.count);
      });
      return stats;
    });
}

export { initSocket, getCapsuleStats };
