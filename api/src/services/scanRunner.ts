import type { CachedSubdomainResult, Env, KVCacheEntry, SSEEvent } from "../types";
import { setCacheEntry } from "./cacheService";
import { type OsintSource, runOsintSources } from "./osintService";
import { batchResolve } from "./dnsWorker";

export async function performFullScan(
  domain: string,
  sources: OsintSource[],
  env: Env,
  onEvent?: (event: SSEEvent) => void
): Promise<KVCacheEntry> {
  const allResults: CachedSubdomainResult[] = [];
  const seen = new Set<string>();

  await runOsintSources(
    domain,
    sources,
    {
      onProgress: (message, percent) => {
        onEvent?.({ event: "progress", message, percent });
      },
      onDiscovery: async (batch, _source) => {
        const fresh = batch.filter((r) => {
          const key = r.subdomain.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        allResults.push(...fresh);
        for (const r of fresh) {
          onEvent?.({ event: "subdomain", ...r });
        }
      },
      onError: (source, error) => {
        onEvent?.({ event: "error", message: `${source}: ${error.message}` });
      },
    }
  );

  // DNS resolution phase
  if (allResults.length > 0) {
    onEvent?.({ event: "progress", message: "Resolving DNS records...", percent: 60 });

    const ipMap = await batchResolve(allResults.map((r) => r.subdomain), 10);

    for (const result of allResults) {
      const ips = ipMap.get(result.subdomain) ?? [];
      result.ipAddresses = ips;
      result.resolved = ips.length > 0;
      // Re-emit subdomain with IPs populated so SSE consumers can update their UI
      onEvent?.({ event: "subdomain", ...result });
    }
  }

  const entry: KVCacheEntry = {
    results: allResults,
    fetchedAt: Date.now(),
    sources: sources.length === 0 ? ["crtsh", "hackertarget"] : sources,
    totalFound: allResults.length,
    totalResolved: allResults.filter((r) => r.resolved).length,
  };

  await setCacheEntry(env.SCAN_CACHE, domain, entry);

  onEvent?.({
    event: "complete",
    total: entry.totalFound,
    resolved: entry.totalResolved,
    cachedAt: entry.fetchedAt,
  });

  return entry;
}
