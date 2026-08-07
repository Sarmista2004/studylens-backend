import express from "express";
import pool from "../config/db.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM events WHERE user_id = ? ORDER BY date ASC",
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  const { title, date, start_time, end_time, subject } = req.body;
  if (!title || !date) {
    return res.status(400).json({ error: "Missing title or date" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO events (user_id, title, date, start_time, end_time, subject) VALUES (?, ?, ?, ?, ?, ?)",
      [req.userId, title, date, start_time || null, end_time || null, subject || null]
    );
    res.status(201).json({ id: result.insertId, title, date, start_time, end_time, subject });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM events WHERE id = ? AND user_id = ?",
      [req.params.id, req.userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;