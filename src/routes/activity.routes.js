import express from "express";
import pool from "../config/db.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

// GET recent activity for the logged-in user
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM activity WHERE user_id = ? ORDER BY timestamp DESC LIMIT 20",
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST a new activity log entry
router.post("/", async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Missing text" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO activity (user_id, text) VALUES (?, ?)",
      [req.userId, text]
    );
    res.status(201).json({ id: result.insertId, text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
