import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env, RefreshJobPayload } from "./types";
import { auth } from "./auth";
import { scans } from "./scans";
import { scanRoutes } from "./routes/scanRoutes";
import { performFullScan } from "./services/scanRunner";
import type { OsintSource } from "./services/osintService";
import type { MessageBatch } from "@cloudflare/workers-types";

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use(
  "*",
  cors({
    origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://subdomain-finder-4ag.pages.dev",
    "https://subdomainfinder.yashlunawat.com",
  ],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["X-Cache", "X-Cache-Age"],
    credentials: true,
  })
);

// Health check
app.get("/api/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Mount routes
app.route("/api/auth", auth);
app.route("/api/scans", scans);
app.route("/api/scan", scanRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error("API Error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

// Queue consumer for background refresh jobs
async function queueHandler(
  batch: MessageBatch<RefreshJobPayload>,
  env: Env
): Promise<void> {
  for (const message of batch.messages) {
    const { domain, sources, resolveDns, concurrency, timeout } = message.body;
    try {
      await performFullScan(domain, sources as OsintSource[], env, undefined, {
        resolveDns,
        concurrency,
        timeoutMs: timeout ? timeout * 1000 : undefined,
      });
      message.ack();
    } catch (err) {
      console.error(`Queue scan failed for ${domain}:`, err);
      message.retry();
    }
  }
}

export default {
  fetch: app.fetch,
  queue: queueHandler,
};
