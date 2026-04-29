import { D1Database, KVNamespace, Queue } from "@cloudflare/workers-types";

export type Env = {
  DB: D1Database;
  JWT_SECRET: string;
  SCAN_CACHE: KVNamespace;
  REFRESH_QUEUE?: Queue<RefreshJobPayload>;
};

export type KVCacheEntry = {
  results: CachedSubdomainResult[];
  fetchedAt: number;
  sources: string[];
  totalFound: number;
  totalResolved: number;
};

export type CachedSubdomainResult = {
  subdomain: string;
  ipAddresses: string[];
  source: string;
  resolved: boolean;
  discoveredAt: number;
};

export type RefreshJobPayload = {
  domain: string;
  sources: string[];
  triggeredAt: number;
};

export type CacheStatus = "HIT" | "STALE" | "MISS";

export type SSEEvent =
  | { event: "subdomain"; subdomain: string; ipAddresses: string[]; source: string; resolved: boolean; discoveredAt: number }
  | { event: "progress"; message: string; percent: number }
  | { event: "complete"; total: number; resolved: number; cachedAt: number }
  | { event: "error"; message: string };

export type User = {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
};

export type Scan = {
  id: string;
  user_id: string;
  domain: string;
  status: "running" | "completed" | "failed";
  total_found: number;
  total_resolved: number;
  sources: string;
  created_at: string;
  completed_at: string | null;
};

export type ScanResult = {
  id: string;
  scan_id: string;
  subdomain: string;
  ip_addresses: string;
  source: string;
  resolved: number;
  discovered_at: string;
};

export type JWTPayload = {
  sub: string;
  email: string;
  exp: number;
};
