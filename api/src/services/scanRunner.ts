import type { CachedSubdomainResult, Env, KVCacheEntry, SourceRunResult, SSEEvent } from "../types";
import { setCacheEntry } from "./cacheService";
import { DEFAULT_OSINT_SOURCES, type OsintCallbacks, type OsintSource, runOsintSources } from "./osintService";
import { batchResolve } from "./dnsWorker";

type ScanOptions = {
  resolveDns?: boolean;
  concurrency?: number;
  timeoutMs?: number;
  osintRunner?: (
    domain: string,
    sources: OsintSource[],
    callbacks: OsintCallbacks,
    signal?: AbortSignal,
    timeoutMs?: number
  ) => Promise<SourceRunResult[]>;
  dnsResolver?: typeof batchResolve;
};

export class ScanSourcesFailedError extends Error {
  constructor(message: string, readonly sources: SourceRunResult[]) {
    super(message);
    this.name = "ScanSourcesFailedError";
  }
}

export async function performFullScan(
  domain: string,
  sources: OsintSource[],
  env: Env,
  onEvent?: (event: SSEEvent) => void,
  options: ScanOptions = {}
): Promise<KVCacheEntry> {
  const allResults: CachedSubdomainResult[] = [];
  const seen = new Set<string>();
  const activeSources = sources.length === 0 ? DEFAULT_OSINT_SOURCES : sources;
  const timeoutMs = clamp(options.timeoutMs ?? 20_000, 5_000, 30_000);
  const concurrency = clamp(options.concurrency ?? 10, 1, 50);
  const shouldResolveDns = options.resolveDns ?? true;
  const osintRunner = options.osintRunner ?? runOsintSources;
  const dnsResolver = options.dnsResolver ?? batchResolve;

  const sourceStatuses = await osintRunner(
    domain,
    sources,
    {
      onProgress: (message, percent) => {
        onEvent?.({ event: "progress", message, percent });
      },
      onSourceStatus: (source, status, message, count) => {
        onEvent?.({ event: "source", source, status, message, count });
      },
      onDiscovery: async (batch) => {
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
    },
    undefined,
    timeoutMs
  );

  const successfulSources = sourceStatuses.filter((source) => source.status === "succeeded");
  if (successfulSources.length === 0) {
    const message = "All selected sources failed or were rate limited. No results were cached.";
    onEvent?.({ event: "error", message, fatal: true });
    throw new ScanSourcesFailedError(message, sourceStatuses);
  }

  if (allResults.length > 0 && shouldResolveDns) {
    onEvent?.({ event: "progress", message: "Resolving DNS records...", percent: 70 });
    const ipMap = await dnsResolver(allResults.map((r) => r.subdomain), concurrency, undefined, Math.min(timeoutMs, 10_000));

    for (const result of allResults) {
      const ips = ipMap.get(result.subdomain) ?? [];
      result.ipAddresses = ips;
      result.resolved = ips.length > 0;
      onEvent?.({ event: "subdomain", ...result });
    }
  } else if (!shouldResolveDns) {
    onEvent?.({ event: "progress", message: "DNS resolution skipped.", percent: 90 });
  }

  const completionStatus = sourceStatuses.some((source) => source.status !== "succeeded")
    ? "partial"
    : "success";

  const entry: KVCacheEntry = {
    results: allResults,
    fetchedAt: Date.now(),
    sources: activeSources,
    sourceStatuses,
    totalFound: allResults.length,
    totalResolved: allResults.filter((r) => r.resolved).length,
  };

  await setCacheEntry(env.SCAN_CACHE, domain, entry);

  onEvent?.({
    event: "complete",
    total: entry.totalFound,
    resolved: entry.totalResolved,
    cachedAt: entry.fetchedAt,
    status: completionStatus,
    sources: sourceStatuses,
  });

  return entry;
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(Math.floor(value), min), max);
}
