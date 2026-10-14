import { create } from "zustand";
import type { ScanOutcome, ScanProgress, ScanResult, ScanStatus, SourceProgress } from "../types/scan.types";
import type { OsintSource } from "../types/osint.types";
import {
  type CacheStatus,
  type CachedSubdomainResult,
  getScanResults,
  openScanStream,
  triggerRefresh,
} from "../lib/services/scanApiService";
import { track } from "../lib/analytics";

const initialProgress: ScanProgress = {
  percent: 0,
  found: 0,
  resolved: 0,
  currentSource: "",
  message: "Ready to scan",
  startedAt: null,
  endedAt: null,
};

export type ScanConfig = {
  domain: string;
  sources: OsintSource[];
  resolveDns: boolean;
  concurrency: number;
  timeout: number;
};

export type ScanTrigger = "form" | "url";

function durationSince(startedAt: number | null): number | null {
  return startedAt ? Date.now() - startedAt : null;
}

type ScanState = {
  status: ScanStatus;
  outcome: ScanOutcome | null;
  progress: ScanProgress;
  results: ScanResult[];
  sourceStatuses: SourceProgress[];
  config: ScanConfig | null;
  cacheStatus: CacheStatus | null;
  cachedAt: number | null;
  isRefreshing: boolean;
  lastError: string | null;
  abortController: AbortController | null;
  streamCleanup: (() => void) | null;

  startScan: (config: ScanConfig, trigger?: ScanTrigger) => Promise<void>;
  pauseScan: () => void;
  resumeScan: () => void;
  stopScan: () => void;
  clearResults: () => void;
  addResults: (results: ScanResult[]) => void;
  updateProgress: (update: Partial<ScanProgress>) => void;
  forceRefresh: () => void;
};

let resultIdCounter = 0;

function mapCachedResult(r: CachedSubdomainResult): ScanResult {
  return {
    id: `result-${++resultIdCounter}`,
    subdomain: r.subdomain,
    ipAddresses: r.ipAddresses,
    statusCode: null,
    responseTime: null,
    https: false,
    source: r.source,
    resolved: r.resolved,
    discoveredAt: r.discoveredAt,
  };
}

function selectedSources(config: ScanConfig): string[] {
  return config.sources.includes("all" as OsintSource)
    ? []
    : config.sources;
}

function buildCompleteMessage(total: number, outcome: "success" | "partial"): string {
  if (outcome === "partial") {
    return total > 0
      ? `Partial scan complete. Found ${total} subdomains.`
      : "Partial scan complete, but no subdomains were found.";
  }
  return total > 0
    ? `Scan complete. Found ${total} subdomains.`
    : "Scan complete. No subdomains found by the selected sources.";
}

export const useScanStore = create<ScanState>((set, get) => ({
  status: "idle",
  outcome: null,
  progress: initialProgress,
  results: [],
  sourceStatuses: [],
  config: null,
  cacheStatus: null,
  cachedAt: null,
  isRefreshing: false,
  lastError: null,
  abortController: null,
  streamCleanup: null,

  startScan: async (config: ScanConfig, trigger: ScanTrigger = "form") => {
    track("scan_started", {
      domain: config.domain,
      sources: config.sources,
      source_count: config.sources.length,
      resolve_dns: config.resolveDns,
      concurrency: config.concurrency,
      timeout_s: config.timeout,
      trigger,
    });
    set({
      config,
      status: "idle",
      outcome: null,
      results: [],
      sourceStatuses: [],
      cacheStatus: null,
      cachedAt: null,
      isRefreshing: false,
      lastError: null,
      progress: { ...initialProgress, message: "Checking cache...", startedAt: Date.now() },
    });

    let cacheStatus: CacheStatus = "MISS";
    try {
      const { data, cacheStatus: cs } = await getScanResults(config.domain);
      cacheStatus = cs;

      if (cs === "HIT") {
        track("scan_completed", {
          domain: config.domain,
          outcome: "success",
          total: data.results.length,
          resolved: data.results.filter((r) => r.resolved).length,
          cache_status: "HIT",
          duration_ms: durationSince(get().progress.startedAt),
        });
        set({
          status: "completed",
          outcome: "success",
          cacheStatus: "HIT",
          cachedAt: data.meta.fetchedAt,
          results: data.results.map(mapCachedResult),
          progress: {
            ...initialProgress,
            percent: 100,
            found: data.results.length,
            resolved: data.results.filter((r) => r.resolved).length,
            message: `Loaded ${data.results.length} cached subdomains`,
            startedAt: Date.now(),
            endedAt: Date.now(),
          },
        });
        return;
      }

      if (cs === "STALE") {
        set({
          status: "running",
          outcome: null,
          cacheStatus: "STALE",
          cachedAt: data.meta.fetchedAt,
          isRefreshing: true,
          results: data.results.map(mapCachedResult),
          progress: {
            ...initialProgress,
            percent: 5,
            found: data.results.length,
            resolved: data.results.filter((r) => r.resolved).length,
            message: "Showing cached results while refreshing...",
            startedAt: Date.now(),
            endedAt: null,
          },
        });
        openScanStreamAndMerge(config);
        return;
      }
    } catch {
      cacheStatus = "MISS";
    }

    if (cacheStatus === "MISS") {
      openScanStreamAndMerge(config);
    }
  },

  pauseScan: () => {
    const { streamCleanup } = get();
    streamCleanup?.();
    set({ status: "paused", streamCleanup: null });
  },

  resumeScan: () => {
    const { config, status } = get();
    if (config && status === "paused") {
      set({ status: "running", lastError: null });
      openScanStreamAndMerge(config);
    }
  },

  stopScan: () => {
    const { streamCleanup, config, progress, results } = get();
    track("scan_stopped", {
      domain: config?.domain,
      found: results.length,
      duration_ms: durationSince(progress.startedAt),
    });
    streamCleanup?.();
    set({
      status: "completed",
      outcome: get().results.length > 0 ? "partial" : "failed",
      isRefreshing: false,
      streamCleanup: null,
      abortController: null,
      progress: {
        ...get().progress,
        percent: 100,
        message: "Scan stopped by user",
        endedAt: Date.now(),
      },
    });
  },

  clearResults: () => {
    const { streamCleanup } = get();
    streamCleanup?.();
    set({
      status: "idle",
      outcome: null,
      results: [],
      sourceStatuses: [],
      progress: initialProgress,
      config: null,
      cacheStatus: null,
      cachedAt: null,
      isRefreshing: false,
      lastError: null,
      abortController: null,
      streamCleanup: null,
    });
  },

  addResults: (newResults) => {
    set((state) => ({
      results: [...state.results, ...newResults],
      progress: {
        ...state.progress,
        found: state.results.length + newResults.length,
      },
    }));
  },

  updateProgress: (update) => {
    set((state) => ({ progress: { ...state.progress, ...update } }));
  },

  forceRefresh: () => {
    const { config } = get();
    if (!config) return;

    track("scan_refreshed", { domain: config.domain, cache_status: get().cacheStatus });
    set({ isRefreshing: true, status: "running", outcome: null, lastError: null });
    triggerRefresh(config.domain, {
      sources: selectedSources(config),
      resolveDns: config.resolveDns,
      concurrency: config.concurrency,
      timeout: config.timeout,
    }).catch(() => {});
    openScanStreamAndMerge(config);
  },
}));

function openScanStreamAndMerge(config: ScanConfig) {
  const abortController = new AbortController();

  set((state) => ({
    status: "running",
    abortController,
    streamCleanup: null,
    lastError: null,
    progress: {
      ...state.progress,
      message: state.cacheStatus === "STALE" ? "Refreshing cached results..." : "Starting live scan...",
      startedAt: state.progress.startedAt ?? Date.now(),
      endedAt: null,
    },
  }));

  const cleanup = openScanStream(config.domain, {
    sources: selectedSources(config),
    resolveDns: config.resolveDns,
    concurrency: config.concurrency,
    timeout: config.timeout,
    signal: abortController.signal,
    onEvent: (ev) => {
      if (ev.event === "source") {
        useScanStore.setState((state) => {
          const existing = state.sourceStatuses.filter((source) => source.source !== ev.source);
          return {
            sourceStatuses: [
              ...existing,
              {
                source: ev.source,
                status: ev.status,
                message: ev.message,
                count: ev.count ?? 0,
              },
            ],
            progress: {
              ...state.progress,
              currentSource: ev.source,
              message: ev.message,
            },
          };
        });
      }

      if (ev.event === "subdomain") {
        useScanStore.setState((state) => {
          const idx = state.results.findIndex(
            (r) => r.subdomain.toLowerCase() === ev.subdomain.toLowerCase()
          );
          if (idx >= 0) {
            const updated = [...state.results];
            updated[idx] = {
              ...updated[idx],
              ipAddresses: ev.ipAddresses,
              source: updated[idx].source === ev.source ? updated[idx].source : `${updated[idx].source}, ${ev.source}`,
              resolved: ev.resolved,
            };
            const resolvedCount = updated.filter((r) => r.resolved).length;
            return {
              results: updated,
              progress: { ...state.progress, found: updated.length, resolved: resolvedCount },
            };
          }

          const newResult: ScanResult = {
            id: `result-${++resultIdCounter}`,
            subdomain: ev.subdomain,
            ipAddresses: ev.ipAddresses,
            statusCode: null,
            responseTime: null,
            https: false,
            source: ev.source,
            resolved: ev.resolved,
            discoveredAt: ev.discoveredAt,
          };
          const newResults = [...state.results, newResult];
          return {
            results: newResults,
            progress: {
              ...state.progress,
              found: newResults.length,
            },
          };
        });
      }

      if (ev.event === "progress") {
        useScanStore.setState((state) => ({
          progress: { ...state.progress, message: ev.message, percent: ev.percent },
        }));
      }

      if (ev.event === "complete") {
        const before = useScanStore.getState();
        track("scan_completed", {
          domain: config.domain,
          outcome: ev.status,
          total: ev.total,
          resolved: ev.resolved,
          cache_status: before.cacheStatus ?? "MISS",
          sources_ok: ev.sources.filter((source) => source.status === "succeeded").length,
          sources_failed: ev.sources.filter((source) => source.status !== "succeeded").length,
          duration_ms: durationSince(before.progress.startedAt),
        });
        useScanStore.setState((state) => ({
          status: "completed",
          outcome: ev.status,
          cacheStatus: "HIT",
          cachedAt: ev.cachedAt,
          isRefreshing: false,
          streamCleanup: null,
          sourceStatuses: ev.sources.map((source) => ({
            source: source.source,
            status: source.status,
            message: source.message,
            count: source.count,
          })),
          progress: {
            ...state.progress,
            percent: 100,
            found: ev.total,
            resolved: ev.resolved,
            message: buildCompleteMessage(ev.total, ev.status),
            endedAt: Date.now(),
          },
        }));
      }

      if (ev.event === "error") {
        const before = useScanStore.getState();
        track("scan_failed", {
          domain: config.domain,
          error: ev.message,
          fatal: Boolean(ev.fatal),
          found: before.results.length,
          duration_ms: durationSince(before.progress.startedAt),
        });
        useScanStore.setState((state) => ({
          status: ev.fatal || state.results.length === 0 ? "failed" : "completed",
          outcome: ev.fatal || state.results.length === 0 ? "failed" : "partial",
          isRefreshing: false,
          streamCleanup: null,
          lastError: ev.message,
          progress: {
            ...state.progress,
            message: ev.fatal ? ev.message : `Warning: ${ev.message}`,
            endedAt: Date.now(),
          },
        }));
      }
    },
    onError: (err) => {
      const before = useScanStore.getState();
      track("scan_failed", {
        domain: config.domain,
        error: err.message,
        fatal: before.results.length === 0,
        found: before.results.length,
        duration_ms: durationSince(before.progress.startedAt),
      });
      useScanStore.setState((state) => ({
        status: state.results.length > 0 ? "completed" : "failed",
        outcome: state.results.length > 0 ? "partial" : "failed",
        isRefreshing: false,
        streamCleanup: null,
        lastError: err.message,
        progress: {
          ...state.progress,
          message: `Connection error: ${err.message}`,
          endedAt: Date.now(),
        },
      }));
    },
  });

  useScanStore.setState({ streamCleanup: cleanup });
}

function set(partial: Partial<ScanState> | ((s: ScanState) => Partial<ScanState>)) {
  useScanStore.setState(partial as Parameters<typeof useScanStore.setState>[0]);
}
