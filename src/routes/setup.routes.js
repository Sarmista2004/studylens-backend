import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// One-time setup route: creates all tables on whatever database this
// server is connected to. Safe to call more than once — every
// statement uses IF NOT EXISTS / already-exists handling.
//
// Protect it with a simple shared-secret query param so randoms can't
// spam it: GET /api/setup-db?key=YOUR_SETUP_KEY
router.get("/setup-db", async (req, res) => {
  if (req.query.key !== process.env.SETUP_KEY) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      name          VARCHAR(255) NOT NULL,
      email         VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS subjects (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      user_id    INT NOT NULL,
      name       VARCHAR(255) NOT NULL,
      goal       INT NOT NULL,
      progress   INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS sessions (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      user_id    INT NOT NULL,
      subject    VARCHAR(255) NOT NULL,
      date       DATE NOT NULL,
      minutes    INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS events (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      user_id    INT NOT NULL,
      title      VARCHAR(255) NOT NULL,
      date       DATE NOT NULL,
      start_time TIME NULL,
      end_time   TIME NULL,
      subject    VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS activity (
      id        INT AUTO_INCREMENT PRIMARY KEY,
      user_id   INT NOT NULL,
      text      VARCHAR(500) NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS settings (
      user_id          INT PRIMARY KEY,
      name             VARCHAR(255) NULL,
      daily_goal_hours DECIMAL(5,2) NOT NULL DEFAULT 2,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
  ];

  const indexes = [
    "CREATE INDEX idx_subjects_user ON subjects(user_id)",
    "CREATE INDEX idx_sessions_user ON sessions(user_id)",
    "CREATE INDEX idx_sessions_date ON sessions(date)",
    "CREATE INDEX idx_events_user ON events(user_id)",
    "CREATE INDEX idx_events_date ON events(date)",
    "CREATE INDEX idx_activity_user ON activity(user_id)",
  ];

  try {
    for (const sql of statements) {
      await pool.query(sql);
    }

    for (const sql of indexes) {
      try {
        await pool.query(sql);
      } catch (err) {
        if (err.code !== "ER_DUP_KEYNAME") throw err;
      }
    }

    res.json({ success: true, message: "All tables created successfully." });
  } catch (err) {
    console.error("Setup failed:", err);
    res.status(500).json({ error: "Setup failed", details: err.message });
  }
});

export default router;