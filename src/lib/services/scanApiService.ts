const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8787";

export type CacheStatus = "HIT" | "STALE" | "MISS";
export type SourceRunStatus = "running" | "succeeded" | "failed" | "rate_limited";

export type SourceRunResult = {
  source: string;
  status: Exclude<SourceRunStatus, "running">;
  count: number;
  message: string;
  durationMs: number;
};

export type CachedSubdomainResult = {
  subdomain: string;
  ipAddresses: string[];
  source: string;
  resolved: boolean;
  discoveredAt: number;
};

export type ScanCacheResponse = {
  results: CachedSubdomainResult[];
  meta: {
    fetchedAt: number | null;
    status: CacheStatus;
  };
};

export type SSEEvent =
  | { event: "subdomain"; subdomain: string; ipAddresses: string[]; source: string; resolved: boolean; discoveredAt: number }
  | { event: "progress"; message: string; percent: number }
  | { event: "source"; source: string; status: SourceRunStatus; message: string; count?: number }
  | { event: "complete"; total: number; resolved: number; cachedAt: number; status: "success" | "partial"; sources: SourceRunResult[] }
  | { event: "error"; message: string; fatal?: boolean };

export async function getScanResults(domain: string): Promise<{
  data: ScanCacheResponse;
  cacheStatus: CacheStatus;
  cacheAge: number | null;
}> {
  const res = await fetch(`${API_BASE}/api/scan/${encodeURIComponent(domain)}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);

  const cacheStatus = (res.headers.get("X-Cache") ?? "MISS") as CacheStatus;
  const ageHeader = res.headers.get("X-Cache-Age");
  const cacheAge = ageHeader ? parseInt(ageHeader, 10) : null;
  const data: ScanCacheResponse = await res.json();

  return { data, cacheStatus, cacheAge };
}

// Uses fetch + ReadableStream instead of EventSource so AbortSignal works for pause/stop
export function openScanStream(
  domain: string,
  options: {
    sources?: string[];
    resolveDns?: boolean;
    concurrency?: number;
    timeout?: number;
    signal?: AbortSignal;
    onEvent: (event: SSEEvent) => void;
    onError?: (err: Error) => void;
  }
): () => void {
  const { sources, resolveDns = true, concurrency, timeout, signal, onEvent, onError } = options;
  const controller = new AbortController();

  // Combine external signal with internal one so caller can abort too
  if (signal) {
    signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  const params = new URLSearchParams();
  if (sources && sources.length > 0) params.set("sources", sources.join(","));
  params.set("resolveDns", String(resolveDns));
  if (concurrency) params.set("concurrency", String(concurrency));
  if (timeout) params.set("timeout", String(timeout));

  const url = `${API_BASE}/api/scan/${encodeURIComponent(domain)}/stream?${params}`;

  (async () => {
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "text/event-stream" },
      });

      if (!res.ok || !res.body) {
        throw new Error(`Stream error ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE lines are separated by "\n\n"
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";

        for (const chunk of chunks) {
          const dataLine = chunk.split("\n").find((l) => l.startsWith("data: "));
          if (!dataLine) continue;
          try {
            const parsed = JSON.parse(dataLine.slice(6)) as SSEEvent;
            onEvent(parsed);
          } catch {
            // malformed JSON — skip
          }
        }
      }
    } catch (err) {
      if (controller.signal.aborted) return; // expected abort — not an error
      onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  })();

  return () => controller.abort();
}

export async function triggerRefresh(
  domain: string,
  options?: { sources?: string[]; resolveDns?: boolean; concurrency?: number; timeout?: number }
): Promise<void> {
  await fetch(`${API_BASE}/api/scan/${encodeURIComponent(domain)}/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sources: options?.sources ?? ["crtsh", "certspotter", "hackertarget", "wayback"],
      resolveDns: options?.resolveDns,
      concurrency: options?.concurrency,
      timeout: options?.timeout,
    }),
  });
}
