import type { CachedSubdomainResult, SourceRunResult, SourceRunStatus } from "../types";

export type OsintSource = "crtsh" | "certspotter" | "hackertarget" | "wayback" | "urlscan";

export const DEFAULT_OSINT_SOURCES: OsintSource[] = ["crtsh", "certspotter", "hackertarget", "wayback"];

export type OsintCallbacks = {
  onDiscovery: (results: CachedSubdomainResult[], source: OsintSource) => void | Promise<void>;
  onProgress: (message: string, percent: number) => void;
  onSourceStatus?: (source: OsintSource, status: SourceRunStatus, message: string, count?: number) => void;
};

export async function runOsintSources(
  domain: string,
  sources: OsintSource[],
  callbacks: OsintCallbacks,
  signal?: AbortSignal,
  timeoutMs = 20_000
): Promise<SourceRunResult[]> {
  const shouldRunAll = sources.length === 0 || (sources as string[]).includes("all");
  const active: OsintSource[] = shouldRunAll ? DEFAULT_OSINT_SOURCES : sources;

  callbacks.onProgress("Starting OSINT scan...", 5);

  return Promise.all(
    active.map(async (source) => {
      const startedAt = Date.now();
      callbacks.onSourceStatus?.(source, "running", `Querying ${getSourceLabel(source)}...`);

      try {
        callbacks.onProgress(`Querying ${getSourceLabel(source)}...`, getSourceStartPercent(source));
        const results = await querySource(source, domain, signal, timeoutMs);
        const message = results.length > 0
          ? `Found ${results.length} subdomains from ${getSourceLabel(source)}`
          : `${getSourceLabel(source)} completed with no results`;

        if (results.length > 0) await callbacks.onDiscovery(results, source);
        callbacks.onSourceStatus?.(source, "succeeded", message, results.length);
        callbacks.onProgress(message, getSourceEndPercent(source));
        return sourceResult(source, "succeeded", results.length, message, startedAt);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        const status = isRateLimitError(error) ? "rate_limited" : "failed";
        const message = `${getSourceLabel(source)} ${status === "rate_limited" ? "rate limited" : "failed"}: ${error.message}`;
        callbacks.onSourceStatus?.(source, status, message, 0);
        callbacks.onProgress(message, getSourceEndPercent(source));
        return sourceResult(source, status, 0, message, startedAt);
      }
    })
  );
}

export function normalizeDiscoveredHostname(raw: string, domain: string, allowRoot = false): string | null {
  const lowerDomain = domain.trim().toLowerCase().replace(/\.$/, "");
  let value = raw.trim().toLowerCase();
  if (!value) return null;

  try {
    if (/^https?:\/\//i.test(value)) value = new URL(value).hostname;
  } catch {
    return null;
  }

  value = value
    .split("/")[0]
    .split("?")[0]
    .split("#")[0]
    .replace(/^\*\./, "")
    .replace(/\.$/, "");

  if (!value) return null;
  if (value === lowerDomain) return allowRoot ? value : null;
  if (!value.endsWith(`.${lowerDomain}`)) return null;

  const labels = value.split(".");
  const valid = labels.every((label) => /^(?!-)[a-z0-9-]{1,63}(?<!-)$/.test(label));
  return valid ? value : null;
}

function sourceResult(
  source: OsintSource,
  status: SourceRunResult["status"],
  count: number,
  message: string,
  startedAt: number
): SourceRunResult {
  return {
    source,
    status,
    count,
    message,
    durationMs: Date.now() - startedAt,
  };
}

function getSourceLabel(source: OsintSource): string {
  switch (source) {
    case "crtsh":
      return "crt.sh";
    case "certspotter":
      return "Cert Spotter";
    case "hackertarget":
      return "HackerTarget";
    case "wayback":
      return "Wayback";
    case "urlscan":
      return "urlscan";
  }
}

function getSourceStartPercent(source: OsintSource): number {
  const order = DEFAULT_OSINT_SOURCES.indexOf(source);
  return 10 + Math.max(order, 0) * 8;
}

function getSourceEndPercent(source: OsintSource): number {
  const order = DEFAULT_OSINT_SOURCES.indexOf(source);
  return 30 + Math.max(order, 0) * 8;
}

function isRateLimitError(error: Error): boolean {
  return /429|rate.?limit|quota|api count exceeded|too many requests/i.test(error.message);
}

async function querySource(
  source: OsintSource,
  domain: string,
  signal: AbortSignal | undefined,
  timeoutMs: number
): Promise<CachedSubdomainResult[]> {
  switch (source) {
    case "crtsh":
      return queryCrtsh(domain, signal, timeoutMs);
    case "certspotter":
      return queryCertSpotter(domain, signal, Math.min(timeoutMs, 15_000));
    case "hackertarget":
      return queryHackerTarget(domain, signal, Math.min(timeoutMs, 15_000));
    case "wayback":
      return queryWayback(domain, signal, Math.min(timeoutMs, 20_000));
    case "urlscan":
      return queryUrlscan(domain, signal, Math.min(timeoutMs, 15_000));
  }
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  signal: AbortSignal | undefined,
  timeoutMs: number
): Promise<Response> {
  const timeout = AbortSignal.timeout(timeoutMs);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
  return fetch(url, { ...init, signal: combined });
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  signal: AbortSignal | undefined,
  timeoutMs: number,
  attempts = 2
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const res = await fetchWithTimeout(url, init, signal, timeoutMs);
      if (res.ok || (res.status < 500 && res.status !== 429)) return res;
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError ?? new Error("Request failed");
}

function toResults(subdomains: Set<string>, source: OsintSource): CachedSubdomainResult[] {
  const now = Date.now();
  return Array.from(subdomains).sort().map((subdomain) => ({
    subdomain,
    ipAddresses: [],
    source,
    resolved: false,
    discoveredAt: now,
  }));
}

async function queryCrtsh(
  domain: string,
  signal?: AbortSignal,
  timeoutMs = 30_000
): Promise<CachedSubdomainResult[]> {
  const url = `https://crt.sh/?q=%25.${encodeURIComponent(domain)}&output=json`;
  const res = await fetchWithRetry(url, { headers: { Accept: "application/json" } }, signal, timeoutMs, 2);
  if (!res.ok) throw new Error(`crt.sh returned ${res.status}`);

  type CrtshEntry = { name_value: string; common_name: string };
  const data: CrtshEntry[] = await res.json();
  const subdomains = new Set<string>();

  for (const entry of data) {
    for (const name of entry.name_value.split("\n")) {
      const cleaned = normalizeDiscoveredHostname(name, domain);
      if (cleaned) subdomains.add(cleaned);
    }
    const cn = normalizeDiscoveredHostname(entry.common_name, domain);
    if (cn) subdomains.add(cn);
  }

  return toResults(subdomains, "crtsh");
}

async function queryCertSpotter(
  domain: string,
  signal?: AbortSignal,
  timeoutMs = 15_000
): Promise<CachedSubdomainResult[]> {
  const params = new URLSearchParams({
    domain,
    include_subdomains: "true",
    expand: "dns_names",
  });
  const url = `https://api.certspotter.com/v1/issuances?${params}`;
  const res = await fetchWithTimeout(url, { headers: { Accept: "application/json" } }, signal, timeoutMs);
  if (res.status === 429) throw new Error("rate limit exceeded");
  if (!res.ok) throw new Error(`Cert Spotter returned ${res.status}`);

  type CertSpotterEntry = { dns_names?: string[] };
  const data: CertSpotterEntry[] = await res.json();
  const subdomains = new Set<string>();

  for (const entry of data) {
    for (const name of entry.dns_names ?? []) {
      const cleaned = normalizeDiscoveredHostname(name, domain);
      if (cleaned) subdomains.add(cleaned);
    }
  }

  return toResults(subdomains, "certspotter");
}

async function queryHackerTarget(
  domain: string,
  signal?: AbortSignal,
  timeoutMs = 15_000
): Promise<CachedSubdomainResult[]> {
  const url = `https://api.hackertarget.com/hostsearch/?q=${encodeURIComponent(domain)}`;
  const res = await fetchWithTimeout(url, {}, signal, timeoutMs);
  if (!res.ok) throw new Error(`HackerTarget returned ${res.status}`);

  const text = await res.text();
  if (text.includes("API count exceeded") || text.includes("rate limit")) {
    throw new Error("API count exceeded");
  }
  if (text.startsWith("error") || text.includes("No DNS A records")) {
    return [];
  }

  const subdomains = new Set<string>();
  for (const line of text.split("\n")) {
    const [subdomain] = line.split(",");
    const cleaned = normalizeDiscoveredHostname(subdomain ?? "", domain, true);
    if (cleaned) subdomains.add(cleaned);
  }

  return toResults(subdomains, "hackertarget");
}

async function queryWayback(
  domain: string,
  signal?: AbortSignal,
  timeoutMs = 20_000
): Promise<CachedSubdomainResult[]> {
  const params = new URLSearchParams({
    url: `*.${domain}/*`,
    output: "json",
    fl: "original",
    collapse: "urlkey",
    limit: "500",
  });
  const url = `https://web.archive.org/cdx?${params}`;
  const res = await fetchWithTimeout(url, { headers: { Accept: "application/json" } }, signal, timeoutMs);
  if (res.status === 429) throw new Error("rate limit exceeded");
  if (!res.ok) throw new Error(`Wayback returned ${res.status}`);

  const data: unknown = await res.json();
  const subdomains = new Set<string>();
  if (Array.isArray(data)) {
    for (const row of data.slice(1)) {
      const value = Array.isArray(row) ? String(row[0] ?? "") : "";
      const cleaned = normalizeDiscoveredHostname(value, domain);
      if (cleaned) subdomains.add(cleaned);
    }
  }

  return toResults(subdomains, "wayback");
}

async function queryUrlscan(
  domain: string,
  signal?: AbortSignal,
  timeoutMs = 15_000
): Promise<CachedSubdomainResult[]> {
  const params = new URLSearchParams({
    q: `domain:${domain}`,
    size: "100",
  });
  const url = `https://urlscan.io/api/v1/search/?${params}`;
  const res = await fetchWithTimeout(url, { headers: { Accept: "application/json" } }, signal, timeoutMs);
  if (res.status === 429) throw new Error("rate limit exceeded");
  if (!res.ok) throw new Error(`urlscan returned ${res.status}`);

  type UrlscanResult = {
    task?: { domain?: string; url?: string };
    page?: { domain?: string; url?: string };
  };
  const data = await res.json() as { results?: UrlscanResult[]; message?: string };
  if (data.message && /quota|rate/i.test(data.message)) throw new Error(data.message);

  const subdomains = new Set<string>();
  for (const item of data.results ?? []) {
    for (const value of [item.task?.domain, item.task?.url, item.page?.domain, item.page?.url]) {
      const cleaned = normalizeDiscoveredHostname(value ?? "", domain);
      if (cleaned) subdomains.add(cleaned);
    }
  }

  return toResults(subdomains, "urlscan");
}
