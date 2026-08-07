import express from "express";
import pool from "../config/db.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

// GET all sessions for the logged-in user
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM sessions WHERE user_id = ? ORDER BY date DESC",
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST a new session (called when Focus.jsx timer completes)
router.post("/", async (req, res) => {
  const { subject, date, minutes } = req.body;
  if (!subject || !date || !minutes) {
    return res.status(400).json({ error: "Missing subject, date, or minutes" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO sessions (user_id, subject, date, minutes) VALUES (?, ?, ?, ?)",
      [req.userId, subject, date, minutes]
    );
    res.status(201).json({ id: result.insertId, subject, date, minutes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;