import { create } from "zustand";
import type { ScanProgress, ScanResult, ScanStatus } from "../types/scan.types";
import type { OsintSource } from "../types/osint.types";
import {
  type CacheStatus,
  type CachedSubdomainResult,
  getScanResults,
  openScanStream,
  triggerRefresh,
} from "../lib/services/scanApiService";

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

type ScanState = {
  status: ScanStatus;
  progress: ScanProgress;
  results: ScanResult[];
  config: ScanConfig | null;
  cacheStatus: CacheStatus | null;
  cachedAt: number | null;
  isRefreshing: boolean;
  abortController: AbortController | null;
  streamCleanup: (() => void) | null;

  startScan: (config: ScanConfig) => Promise<void>;
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

export const useScanStore = create<ScanState>((set, get) => ({
  status: "idle",
  progress: initialProgress,
  results: [],
  config: null,
  cacheStatus: null,
  cachedAt: null,
  isRefreshing: false,
  abortController: null,
  streamCleanup: null,

  startScan: async (config: ScanConfig) => {
    // Reset state for new scan
    set({
      config,
      results: [],
      cacheStatus: null,
      cachedAt: null,
      isRefreshing: false,
      progress: { ...initialProgress, message: "Checking cache...", startedAt: Date.now() },
    });

    // Phase 1: instant cache check
    let cacheStatus: CacheStatus = "MISS";
    try {
      const { data, cacheStatus: cs } = await getScanResults(config.domain);
      cacheStatus = cs;

      if (cs === "HIT") {
        set({
          status: "completed",
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
        // Show stale results immediately; backend already enqueued a refresh
        set({
          status: "completed",
          cacheStatus: "STALE",
          cachedAt: data.meta.fetchedAt,
          isRefreshing: true,
          results: data.results.map(mapCachedResult),
          progress: {
            ...initialProgress,
            percent: 100,
            found: data.results.length,
            resolved: data.results.filter((r) => r.resolved).length,
            message: `Showing cached results (refreshing in background)`,
            startedAt: Date.now(),
            endedAt: Date.now(),
          },
        });
        return;
      }
    } catch {
      // If API is unreachable, fall through to streaming with MISS
    }

    // Phase 2: MISS — open SSE and stream live results
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
      set({ status: "running" });
      openScanStreamAndMerge(config);
    }
  },

  stopScan: () => {
    const { streamCleanup } = get();
    streamCleanup?.();
    set({
      status: "completed",
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
      results: [],
      progress: initialProgress,
      config: null,
      cacheStatus: null,
      cachedAt: null,
      isRefreshing: false,
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

    set({ isRefreshing: true });
    triggerRefresh(config.domain).catch(() => {});
    // Open SSE to watch the refresh complete
    openScanStreamAndMerge(config);
  },
}));

function openScanStreamAndMerge(config: ScanConfig) {
  const abortController = new AbortController();

  set((state) => ({
    status: "running",
    abortController,
    progress: {
      ...state.progress,
      message: "Starting live scan...",
      startedAt: state.progress.startedAt ?? Date.now(),
    },
  }));

  const cleanup = openScanStream(config.domain, {
    sources: config.sources.includes("all" as OsintSource) ? [] : config.sources,
    resolveDns: config.resolveDns,
    signal: abortController.signal,
    onEvent: (ev) => {
      if (ev.event === "subdomain") {
        useScanStore.setState((state) => {
          const idx = state.results.findIndex(
            (r) => r.subdomain.toLowerCase() === ev.subdomain.toLowerCase()
          );
          if (idx >= 0) {
            // Update existing entry with resolved IPs
            const updated = [...state.results];
            updated[idx] = {
              ...updated[idx],
              ipAddresses: ev.ipAddresses,
              resolved: ev.resolved,
            };
            const resolvedCount = updated.filter((r) => r.resolved).length;
            return {
              results: updated,
              progress: { ...state.progress, resolved: resolvedCount },
            };
          }
          // New subdomain
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
        useScanStore.setState((state) => ({
          status: "completed",
          cacheStatus: "HIT",
          cachedAt: ev.cachedAt,
          isRefreshing: false,
          streamCleanup: null,
          progress: {
            ...state.progress,
            percent: 100,
            found: ev.total,
            resolved: ev.resolved,
            message: `Scan complete. Found ${ev.total} subdomains.`,
            endedAt: Date.now(),
          },
        }));
      }

      if (ev.event === "error") {
        useScanStore.setState((state) => ({
          status: "failed",
          progress: { ...state.progress, message: `Error: ${ev.message}`, endedAt: Date.now() },
        }));
      }
    },
    onError: (err) => {
      useScanStore.setState((state) => ({
        status: "failed",
        progress: { ...state.progress, message: `Connection error: ${err.message}`, endedAt: Date.now() },
      }));
    },
  });

  useScanStore.setState({ streamCleanup: cleanup });
}

// Expose set for the openScanStreamAndMerge closure
function set(partial: Partial<ScanState> | ((s: ScanState) => Partial<ScanState>)) {
  useScanStore.setState(partial as Parameters<typeof useScanStore.setState>[0]);
}
