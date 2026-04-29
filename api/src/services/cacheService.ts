import type { KVNamespace } from "@cloudflare/workers-types";
import type { CacheStatus, KVCacheEntry } from "../types";

const KV_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days absolute expiry in KV
const FRESH_MS = 24 * 60 * 60 * 1000;     // < 24h → HIT
const STALE_MS = 7 * 24 * 60 * 60 * 1000; // 24h–7d → STALE; > 7d → MISS

export function kvKey(domain: string): string {
  return `scan:v1:${domain.toLowerCase()}`;
}

function lockKey(domain: string): string {
  return `lock:v1:${domain.toLowerCase()}`;
}

export async function getCacheEntry(
  kv: KVNamespace,
  domain: string
): Promise<{ entry: KVCacheEntry | null; status: CacheStatus; ageMs: number }> {
  const raw = await kv.get(kvKey(domain));
  if (!raw) return { entry: null, status: "MISS", ageMs: 0 };

  let entry: KVCacheEntry;
  try {
    entry = JSON.parse(raw) as KVCacheEntry;
  } catch {
    return { entry: null, status: "MISS", ageMs: 0 };
  }

  const ageMs = Date.now() - entry.fetchedAt;
  if (ageMs < FRESH_MS) return { entry, status: "HIT", ageMs };
  if (ageMs < STALE_MS) return { entry, status: "STALE", ageMs };
  return { entry: null, status: "MISS", ageMs };
}

export async function setCacheEntry(
  kv: KVNamespace,
  domain: string,
  entry: KVCacheEntry
): Promise<void> {
  await kv.put(kvKey(domain), JSON.stringify(entry), {
    expirationTtl: KV_TTL_SECONDS,
  });
}

export async function getRefreshLock(kv: KVNamespace, domain: string): Promise<boolean> {
  const val = await kv.get(lockKey(domain));
  return val !== null;
}

export async function setRefreshLock(kv: KVNamespace, domain: string): Promise<void> {
  await kv.put(lockKey(domain), "1", { expirationTtl: 60 });
}
