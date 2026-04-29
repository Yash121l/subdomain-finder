import type { CachedSubdomainResult } from "../types";

export type OsintSource = "crtsh" | "hackertarget";

export type OsintCallbacks = {
  onDiscovery: (results: CachedSubdomainResult[], source: OsintSource) => void | Promise<void>;
  onProgress: (message: string, percent: number) => void;
  onError: (source: OsintSource, error: Error) => void;
};

export async function runOsintSources(
  domain: string,
  sources: OsintSource[],
  callbacks: OsintCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const shouldRunAll = sources.length === 0 || (sources as string[]).includes("all");
  const active: OsintSource[] = shouldRunAll ? ["crtsh", "hackertarget"] : sources;

  callbacks.onProgress("Starting OSINT scan...", 5);

  await Promise.allSettled(
    active.map(async (source) => {
      try {
        if (source === "crtsh") {
          callbacks.onProgress("Querying Certificate Transparency logs (crt.sh)...", 10);
          const results = await queryCrtsh(domain, signal);
          if (results.length > 0) {
            callbacks.onProgress(`Found ${results.length} subdomains from crt.sh`, 40);
            await callbacks.onDiscovery(results, "crtsh");
          } else {
            callbacks.onProgress("No results from crt.sh", 40);
          }
        } else if (source === "hackertarget") {
          callbacks.onProgress("Querying HackerTarget DNS search...", 10);
          const results = await queryHackerTarget(domain, signal);
          if (results.length > 0) {
            callbacks.onProgress(`Found ${results.length} subdomains from HackerTarget`, 45);
            await callbacks.onDiscovery(results, "hackertarget");
          } else {
            callbacks.onProgress("No additional results from HackerTarget", 45);
          }
        }
      } catch (err) {
        callbacks.onError(source, err instanceof Error ? err : new Error(String(err)));
      }
    })
  );
}

async function queryCrtsh(domain: string, signal?: AbortSignal): Promise<CachedSubdomainResult[]> {
  const url = `https://crt.sh/?q=%25.${encodeURIComponent(domain)}&output=json`;
  const timeout = AbortSignal.timeout(30_000);
  const combined = signal
    ? AbortSignal.any([signal, timeout])
    : timeout;

  const res = await fetch(url, { signal: combined, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`crt.sh returned ${res.status}`);

  type CrtshEntry = { name_value: string; common_name: string };
  const data: CrtshEntry[] = await res.json();

  const subdomains = new Set<string>();
  const lower = domain.toLowerCase();

  for (const entry of data) {
    for (const name of entry.name_value.split("\n")) {
      const cleaned = name.trim().toLowerCase();
      if (cleaned && !cleaned.startsWith("*") && cleaned.endsWith(`.${lower}`)) {
        subdomains.add(cleaned);
      }
      if (cleaned === lower) subdomains.add(cleaned);
    }
    const cn = entry.common_name.trim().toLowerCase();
    if (cn && !cn.startsWith("*") && cn.endsWith(`.${lower}`)) {
      subdomains.add(cn);
    }
  }

  const now = Date.now();
  return Array.from(subdomains).map((subdomain) => ({
    subdomain,
    ipAddresses: [],
    source: "crtsh",
    resolved: false,
    discoveredAt: now,
  }));
}

async function queryHackerTarget(domain: string, signal?: AbortSignal): Promise<CachedSubdomainResult[]> {
  const url = `https://api.hackertarget.com/hostsearch/?q=${encodeURIComponent(domain)}`;
  const timeout = AbortSignal.timeout(15_000);
  const combined = signal
    ? AbortSignal.any([signal, timeout])
    : timeout;

  const res = await fetch(url, { signal: combined });
  if (!res.ok) throw new Error(`HackerTarget returned ${res.status}`);

  const text = await res.text();
  if (
    text.includes("API count exceeded") ||
    text.startsWith("error") ||
    text.includes("No DNS A records")
  ) {
    return [];
  }

  const subdomains = new Set<string>();
  for (const line of text.split("\n")) {
    const [subdomain] = line.split(",");
    if (subdomain && subdomain.includes(".")) {
      subdomains.add(subdomain.trim().toLowerCase());
    }
  }

  const now = Date.now();
  return Array.from(subdomains).map((subdomain) => ({
    subdomain,
    ipAddresses: [],
    source: "hackertarget",
    resolved: false,
    discoveredAt: now,
  }));
}
