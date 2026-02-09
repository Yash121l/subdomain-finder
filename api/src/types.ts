import { D1Database } from "@cloudflare/workers-types";

export type Env = {
  DB: D1Database;
  JWT_SECRET: string;
};

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
