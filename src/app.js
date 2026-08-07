import express from "express";
import cors from "cors";
import pool from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import subjectsRoutes from "./routes/subjects.routes.js"; // ← add this (match your actual filename)
import sessionsRoutes from "./routes/sessions.routes.js";
import eventsRoutes from "./routes/events.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
// ...

// ...


const app = express();

// In production, set FRONTEND_URL to your deployed frontend's origin
// (e.g. https://your-app.vercel.app). Falls back to allowing all
// origins in local development when FRONTEND_URL isn't set.
const allowedOrigin = process.env.FRONTEND_URL;
app.use(cors(allowedOrigin ? { origin: allowedOrigin } : {}));
app.use(express.json());

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/subjects", subjectsRoutes);
app.use("/api/sessions", sessionsRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/settings", settingsRoutes);
// ← and this
export default app;