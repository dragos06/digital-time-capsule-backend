import express from "express";
import {
  authenticateUser,
  authorizeRole,
} from "../middlewares/authMiddleware.js";
import pool from "../db/pool.js";

const router = express.Router();

router.get(
  "/admin-data",
  authenticateUser,
  authorizeRole([1]),
  async (req, res) => {
    if (req.user.role !== 1) return res.status(403).send("Forbidden");

    const result = await pool.query(`
    SELECT u.user_id, u.email, m.monitored_at
    FROM monitored_users m
    JOIN users u on u.user_id = m.user_id`);
    res.json(result.rows);
  }
);

export default router;
