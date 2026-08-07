import express from "express";
import pool from "../config/db.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

// GET settings for the logged-in user (creates a default row if none exists)
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM settings WHERE user_id = ?",
      [req.userId]
    );

    // Get the user's registered name and email as a fallback
    const [userRows] = await pool.query(
      "SELECT name, email FROM users WHERE id = ?",
      [req.userId]
    );
    const registeredName = userRows[0]?.name || null;
    const registeredEmail = userRows[0]?.email || null;

    if (rows.length === 0) {
      await pool.query(
        "INSERT INTO settings (user_id, name, daily_goal_hours) VALUES (?, ?, 2)",
        [req.userId, registeredName]
      );
      return res.json({
        user_id: req.userId,
        name: registeredName,
        email: registeredEmail,
        daily_goal_hours: 2,
      });
    }

    // If settings row exists but name is empty, fall back to registered name
    const settingsRow = rows[0];
    if (!settingsRow.name) {
      settingsRow.name = registeredName;
    }
    settingsRow.email = registeredEmail;

    res.json(settingsRow);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT update settings
router.put("/", async (req, res) => {
  const { name, daily_goal_hours } = req.body;

  try {
    const [existing] = await pool.query(
      "SELECT * FROM settings WHERE user_id = ?",
      [req.userId]
    );

    if (existing.length === 0) {
      await pool.query(
        "INSERT INTO settings (user_id, name, daily_goal_hours) VALUES (?, ?, ?)",
        [req.userId, name || null, daily_goal_hours || 2]
      );
    } else {
      const current = existing[0];
      await pool.query(
        "UPDATE settings SET name = ?, daily_goal_hours = ? WHERE user_id = ?",
        [name ?? current.name, daily_goal_hours ?? current.daily_goal_hours, req.userId]
      );
    }

    res.json({ user_id: req.userId, name, daily_goal_hours });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;