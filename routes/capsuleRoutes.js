import express from "express";
import {
  getCapsulesController,
  getCapsuleByIdController,
  createCapsuleController,
  updateCapsuleController,
  deleteCapsuleController,
} from "../controllers/capsuleController.js";
import validateCapsule from "../middlewares/validateCapsule.js";
import pool from "../db/pool.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateUser, getCapsulesController);
router.get("/:id", authenticateUser, getCapsuleByIdController);
router.post("/", authenticateUser, validateCapsule, createCapsuleController);
router.put("/:id", authenticateUser, validateCapsule, updateCapsuleController);
router.delete("/:id", authenticateUser, deleteCapsuleController);

router.get("/stats/top-capsules", async (req, res) => {
  try {
    const { rows } = await pool.query(`
            SELECT tc.capsule_id, tc.capsule_title, SUM(m.file_size) AS total_size
            FROM time_capsules tc
            JOIN memories m ON tc.capsule_id = m.capsule_id
            WHERE tc.capsule_status = 'Unlocked'
            AND m.uploaded_at > CURRENT_DATE - INTERVAL '3 months'
            GROUP BY tc.capsule_id, tc.capsule_title
            ORDER BY total_size DESC
            LIMIT 50;`);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
