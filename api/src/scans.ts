import { Hono } from "hono";
import { jwtVerify } from "jose";
import type { Env, Scan, ScanResult, JWTPayload } from "./types";

const scans = new Hono<{ Bindings: Env; Variables: { userId: string } }>();

// Auth middleware
scans.use("*", async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const token = authHeader.slice(7);
    const secretKey = new TextEncoder().encode(c.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secretKey) as { payload: JWTPayload };
    c.set("userId", payload.sub);
    await next();
  } catch {
    return c.json({ error: "Invalid token" }, 401);
  }
});

// List user's scans
scans.get("/", async (c) => {
  const userId = c.get("userId");
  
  const results = await c.env.DB.prepare(
    `SELECT id, domain, status, total_found, total_resolved, sources, created_at, completed_at 
     FROM scans WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`
  ).bind(userId).all<Scan>();

  return c.json({ scans: results.results });
});

// Create new scan
scans.post("/", async (c) => {
  const userId = c.get("userId");
  const { domain, sources = "all" } = await c.req.json<{ domain: string; sources?: string }>();

  if (!domain) {
    return c.json({ error: "Domain is required" }, 400);
  }

  const id = crypto.randomUUID();
  
  await c.env.DB.prepare(
    `INSERT INTO scans (id, user_id, domain, sources, status) VALUES (?, ?, ?, ?, 'running')`
  ).bind(id, userId, domain.toLowerCase(), sources).run();

  return c.json({ 
    scan: { id, domain: domain.toLowerCase(), sources, status: "running" } 
  }, 201);
});

// Get single scan with results
scans.get("/:id", async (c) => {
  const userId = c.get("userId");
  const scanId = c.req.param("id");

  const scan = await c.env.DB.prepare(
    `SELECT * FROM scans WHERE id = ? AND user_id = ?`
  ).bind(scanId, userId).first<Scan>();

  if (!scan) {
    return c.json({ error: "Scan not found" }, 404);
  }

  const results = await c.env.DB.prepare(
    `SELECT * FROM results WHERE scan_id = ? ORDER BY discovered_at DESC LIMIT 1000`
  ).bind(scanId).all<ScanResult>();

  return c.json({ scan, results: results.results });
});

// Update scan (mark as completed)
scans.patch("/:id", async (c) => {
  const userId = c.get("userId");
  const scanId = c.req.param("id");
  const { status, total_found, total_resolved } = await c.req.json<{
    status?: string;
    total_found?: number;
    total_resolved?: number;
  }>();

  // Verify ownership
  const scan = await c.env.DB.prepare(
    `SELECT id FROM scans WHERE id = ? AND user_id = ?`
  ).bind(scanId, userId).first();

  if (!scan) {
    return c.json({ error: "Scan not found" }, 404);
  }

  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (status) {
    updates.push("status = ?");
    values.push(status);
    if (status === "completed" || status === "failed") {
      updates.push("completed_at = ?");
      values.push(new Date().toISOString());
    }
  }
  if (total_found !== undefined) {
    updates.push("total_found = ?");
    values.push(total_found);
  }
  if (total_resolved !== undefined) {
    updates.push("total_resolved = ?");
    values.push(total_resolved);
  }

  if (updates.length > 0) {
    values.push(scanId);
    await c.env.DB.prepare(
      `UPDATE scans SET ${updates.join(", ")} WHERE id = ?`
    ).bind(...values).run();
  }

  return c.json({ success: true });
});

// Add results to scan
scans.post("/:id/results", async (c) => {
  const userId = c.get("userId");
  const scanId = c.req.param("id");
  const { results } = await c.req.json<{
    results: Array<{
      subdomain: string;
      ip_addresses?: string[];
      source: string;
      resolved?: boolean;
    }>;
  }>();

  // Verify ownership
  const scan = await c.env.DB.prepare(
    `SELECT id FROM scans WHERE id = ? AND user_id = ?`
  ).bind(scanId, userId).first();

  if (!scan) {
    return c.json({ error: "Scan not found" }, 404);
  }

  // Batch insert results
  const statements = results.map((result) =>
    c.env.DB.prepare(
      `INSERT INTO results (id, scan_id, subdomain, ip_addresses, source, resolved) 
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      crypto.randomUUID(),
      scanId,
      result.subdomain,
      result.ip_addresses?.join(",") || "",
      result.source,
      result.resolved ? 1 : 0
    )
  );

  await c.env.DB.batch(statements);

  // Update scan counts
  const counts = await c.env.DB.prepare(
    `SELECT COUNT(*) as total, SUM(resolved) as resolved FROM results WHERE scan_id = ?`
  ).bind(scanId).first<{ total: number; resolved: number }>();

  await c.env.DB.prepare(
    `UPDATE scans SET total_found = ?, total_resolved = ? WHERE id = ?`
  ).bind(counts?.total || 0, counts?.resolved || 0, scanId).run();

  return c.json({ success: true, count: results.length });
});

// Delete scan
scans.delete("/:id", async (c) => {
  const userId = c.get("userId");
  const scanId = c.req.param("id");

  const result = await c.env.DB.prepare(
    `DELETE FROM scans WHERE id = ? AND user_id = ?`
  ).bind(scanId, userId).run();

  if (result.meta.changes === 0) {
    return c.json({ error: "Scan not found" }, 404);
  }

  return c.json({ success: true });
});

export { scans };
