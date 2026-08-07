import express from "express";
import pool from "../config/db.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM subjects WHERE user_id = ? ORDER BY created_at DESC",
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  const { name, goal } = req.body;
  if (!name || !goal) {
    return res.status(400).json({ error: "Missing name or goal" });
  }
  try {
    const [result] = await pool.query(
      "INSERT INTO subjects (user_id, name, goal, progress) VALUES (?, ?, ?, 0)",
      [req.userId, name, goal]
    );
    res.status(201).json({ id: result.insertId, name, goal, progress: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT update a subject (name, goal, or progress)
router.put("/:id", async (req, res) => {
  const { name, goal, progress } = req.body;

  try {
    const [existing] = await pool.query(
      "SELECT * FROM subjects WHERE id = ? AND user_id = ?",
      [req.params.id, req.userId]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: "Subject not found" });
    }

    const current = existing[0];
    await pool.query(
      "UPDATE subjects SET name = ?, goal = ?, progress = ? WHERE id = ? AND user_id = ?",
      [
        name ?? current.name,
        goal ?? current.goal,
        progress ?? current.progress,
        req.params.id,
        req.userId,
      ]
    );
    res.json({
      id: Number(req.params.id),
      name: name ?? current.name,
      goal: goal ?? current.goal,
      progress: progress ?? current.progress,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE a subject
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM subjects WHERE id = ? AND user_id = ?",
      [req.params.id, req.userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Subject not found" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;