import { Hono } from "hono";
import type { Env } from "../types";
import { getCacheEntry, getRefreshLock, setCacheEntry, setRefreshLock } from "../services/cacheService";
import { DEFAULT_OSINT_SOURCES, type OsintSource } from "../services/osintService";
import { performFullScan, ScanSourcesFailedError } from "../services/scanRunner";

export const scanRoutes = new Hono<{ Bindings: Env }>();

function normalizeDomain(raw: string): string {
  return raw.trim().replace(/^https?:\/\//i, "").split("/")[0].split("?")[0].toLowerCase();
}

function parseSourcesParam(param: string): OsintSource[] {
  if (!param || param === "all") return [];
  return param.split(",").filter((s): s is OsintSource =>
    s === "crtsh" || s === "certspotter" || s === "hackertarget" || s === "wayback" || s === "urlscan"
  );
}

function parseBoundedInt(value: string | undefined, fallback: number, min: number, max: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
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
  const concurrency = parseBoundedInt(c.req.query("concurrency"), 10, 1, 50);
  const timeoutSeconds = parseBoundedInt(c.req.query("timeout"), 20, 5, 30);
  const sources = parseSourcesParam(sourcesParam);

  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  const send = (data: object) => {
    const line = `data: ${JSON.stringify(data)}\n\n`;
    writer.write(encoder.encode(line)).catch(() => {});
  };

  // Run the scan in background; stream closes when it's done
  performFullScan(domain, sources, c.env, send, {
    resolveDns,
    concurrency,
    timeoutMs: timeoutSeconds * 1000,
  })
    .catch((err) => {
      const message = err instanceof Error ? err.message : "Scan failed";
      send({ event: "error", message, fatal: err instanceof ScanSourcesFailedError });
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
  const body = await c.req.json().catch(() => ({})) as {
    sources?: string[];
    resolveDns?: boolean;
    concurrency?: number;
    timeout?: number;
  };
  const sources = Array.isArray(body.sources)
    ? parseSourcesParam(body.sources.join(","))
    : DEFAULT_OSINT_SOURCES;
  const concurrency = Math.min(Math.max(Number(body.concurrency) || 10, 1), 50);
  const timeout = Math.min(Math.max(Number(body.timeout) || 20, 5), 30);

  if (c.env.REFRESH_QUEUE) {
    await c.env.REFRESH_QUEUE.send({
      domain,
      sources,
      triggeredAt: Date.now(),
      resolveDns: body.resolveDns !== false,
      concurrency,
      timeout,
    });
    return c.json({ queued: true, domain });
  }
  // Queue not available — return 202 so the frontend knows to open SSE instead
  return c.json({ queued: false, domain }, 202);
});
