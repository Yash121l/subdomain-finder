import { Hono } from "hono";
import type { Env } from "../types";
import { getCacheEntry, getRefreshLock, setCacheEntry, setRefreshLock } from "../services/cacheService";
import { type OsintSource } from "../services/osintService";
import { performFullScan } from "../services/scanRunner";

export const scanRoutes = new Hono<{ Bindings: Env }>();

function normalizeDomain(raw: string): string {
  return raw.trim().replace(/^https?:\/\//i, "").split("/")[0].split("?")[0].toLowerCase();
}

function parseSourcesParam(param: string): OsintSource[] {
  if (!param || param === "all") return [];
  return param.split(",").filter((s): s is OsintSource =>
    s === "crtsh" || s === "hackertarget"
  );
}

// GET /api/scan/:domain — instant cache response
scanRoutes.get("/:domain", async (c) => {
  const domain = normalizeDomain(c.req.param("domain"));
  const { entry, status, ageMs } = await getCacheEntry(c.env.SCAN_CACHE, domain);
  const ageSeconds = Math.floor(ageMs / 1000);

  c.header("X-Cache", status);
  c.header("X-Cache-Age", String(ageSeconds));
  c.header("Access-Control-Expose-Headers", "X-Cache, X-Cache-Age");

  if (status === "HIT") {
    return c.json({
      results: entry!.results,
      meta: { fetchedAt: entry!.fetchedAt, status: "HIT" as const },
    });
  }

  if (status === "STALE") {
    // Serve stale immediately; enqueue background refresh if Queue binding available
    if (c.env.REFRESH_QUEUE) {
      const locked = await getRefreshLock(c.env.SCAN_CACHE, domain);
      if (!locked) {
        await setRefreshLock(c.env.SCAN_CACHE, domain);
        await c.env.REFRESH_QUEUE.send({
          domain,
          sources: entry!.sources,
          triggeredAt: Date.now(),
        });
      }
    }
    return c.json({
      results: entry!.results,
      meta: { fetchedAt: entry!.fetchedAt, status: "STALE" as const },
    });
  }

  // MISS
  return c.json({
    results: [],
    meta: { fetchedAt: null, status: "MISS" as const },
  });
});

// GET /api/scan/:domain/stream — SSE live scan
scanRoutes.get("/:domain/stream", async (c) => {
  const domain = normalizeDomain(c.req.param("domain"));
  const sourcesParam = c.req.query("sources") ?? "all";
  const resolveDns = c.req.query("resolveDns") !== "false";
  const sources = parseSourcesParam(sourcesParam);

  // If already fresh in cache, redirect to the GET endpoint
  const { status } = await getCacheEntry(c.env.SCAN_CACHE, domain);
  if (status === "HIT") {
    return c.redirect(`/api/scan/${domain}`);
  }

  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  const send = (data: object) => {
    const line = `data: ${JSON.stringify(data)}\n\n`;
    writer.write(encoder.encode(line)).catch(() => {});
  };

  // Run the scan in background; stream closes when it's done
  performFullScan(domain, sources, c.env, send)
    .catch((err) => {
      send({ event: "error", message: err instanceof Error ? err.message : "Scan failed" });
    })
    .finally(() => {
      writer.close().catch(() => {});
    });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
      "Access-Control-Allow-Origin": c.req.header("Origin") ?? "*",
      "Access-Control-Allow-Credentials": "true",
    },
  });
});

// POST /api/scan/:domain/refresh — manual user-triggered refresh
scanRoutes.post("/:domain/refresh", async (c) => {
  const domain = normalizeDomain(c.req.param("domain"));
  const body = await c.req.json().catch(() => ({})) as { sources?: string[] };
  const sources = Array.isArray(body.sources) ? body.sources : ["crtsh", "hackertarget"];

  if (c.env.REFRESH_QUEUE) {
    await c.env.REFRESH_QUEUE.send({ domain, sources, triggeredAt: Date.now() });
    return c.json({ queued: true, domain });
  }
  // Queue not available — return 202 so the frontend knows to open SSE instead
  return c.json({ queued: false, domain }, 202);
});
