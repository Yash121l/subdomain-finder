import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env } from "./types";
import { auth } from "./auth";
import { scans } from "./scans";

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use("*", cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "https://subdomain-finder.pages.dev"],
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Health check
app.get("/api/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Mount routes
app.route("/api/auth", auth);
app.route("/api/scans", scans);

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error("API Error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
