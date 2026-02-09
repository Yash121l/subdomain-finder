import { create } from "zustand";
import type { ScanProgress, ScanResult, ScanStatus } from "../types/scan.types";
import type { OsintSource, SubdomainDiscovery } from "../types/osint.types";
import { streamSubdomainDiscovery } from "../lib/services/subdomainService";
import { resolveIPs } from "../lib/services/dnsService";

const initialProgress: ScanProgress = {
  percent: 0,
  found: 0,
  resolved: 0,
  currentSource: "",
  message: "Ready to scan",
  startedAt: null,
};

type ScanConfig = {
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
  abortController: AbortController | null;
  
  // Actions
  startScan: (config: ScanConfig) => Promise<void>;
  pauseScan: () => void;
  resumeScan: () => void;
  stopScan: () => void;
  clearResults: () => void;
  addResults: (results: ScanResult[]) => void;
  updateProgress: (update: Partial<ScanProgress>) => void;
};

let resultIdCounter = 0;

export const useScanStore = create<ScanState>((set, get) => ({
  status: "idle",
  progress: initialProgress,
  results: [],
  config: null,
  abortController: null,

  startScan: async (config: ScanConfig) => {
    const abortController = new AbortController();
    
    set({
      status: "running",
      config,
      abortController,
      results: [],
      progress: {
        ...initialProgress,
        message: "Starting scan...",
        startedAt: Date.now(),
      },
    });
    
    const discoveredSubdomains: SubdomainDiscovery[] = [];
    
    await streamSubdomainDiscovery(
      config.domain,
      config.sources,
      {
        onProgress: (message) => {
          const state = get();
          if (state.status !== "running") return;
          
          set({
            progress: {
              ...state.progress,
              message,
            },
          });
        },
        
        onDiscovery: async (discoveries) => {
          const state = get();
          if (state.status !== "running") return;
          
          // Add to discovered list
          discoveredSubdomains.push(...discoveries);
          
          // Convert to results and add
          const newResults: ScanResult[] = discoveries.map((d) => ({
            id: `result-${++resultIdCounter}`,
            subdomain: d.subdomain,
            ipAddresses: [],
            statusCode: null,
            responseTime: null,
            https: false,
            source: d.source,
            resolved: false,
            discoveredAt: d.discoveredAt,
          }));
          
          const currentResults = get().results;
          const existingSubdomains = new Set(currentResults.map(r => r.subdomain.toLowerCase()));
          const uniqueNewResults = newResults.filter(r => !existingSubdomains.has(r.subdomain.toLowerCase()));
          
          set({
            results: [...currentResults, ...uniqueNewResults],
            progress: {
              ...state.progress,
              found: currentResults.length + uniqueNewResults.length,
              percent: 50, // Base progress for discovery phase
            },
          });
          
          // Resolve DNS if enabled
          if (config.resolveDns && uniqueNewResults.length > 0) {
            resolveSubdomainsDns(uniqueNewResults, config.concurrency, config.timeout);
          }
        },
        
        onComplete: () => {
          set((state) => ({
            status: "completed",
            progress: {
              ...state.progress,
              percent: 100,
              message: `Scan complete. Found ${state.results.length} subdomains.`,
            },
          }));
        },
        
        onError: (error) => {
          set((state) => ({
            status: "failed",
            progress: {
              ...state.progress,
              message: `Error: ${error.message}`,
            },
          }));
        },
      },
      abortController.signal
    );
  },

  pauseScan: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
    }
    set({ status: "paused" });
  },

  resumeScan: () => {
    const { config } = get();
    if (config) {
      // Create new abort controller and continue
      set({ status: "running", abortController: new AbortController() });
    }
  },

  stopScan: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
    }
    set({
      status: "completed",
      abortController: null,
      progress: {
        ...get().progress,
        percent: 100,
        message: "Scan stopped by user",
      },
    });
  },

  clearResults: () => {
    set({
      status: "idle",
      results: [],
      progress: initialProgress,
      config: null,
      abortController: null,
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
    set((state) => ({
      progress: { ...state.progress, ...update },
    }));
  },
}));

// Helper function to resolve DNS for subdomains
async function resolveSubdomainsDns(
  results: ScanResult[],
  concurrency: number,
  timeout: number
) {
  const queue = [...results];
  
  const worker = async () => {
    while (queue.length > 0) {
      const result = queue.shift();
      if (!result) break;
      
      try {
        const ips = await resolveIPs(result.subdomain, timeout * 1000);
        
        useScanStore.setState((state) => {
          const updated = state.results.map((r) =>
            r.id === result.id
              ? { ...r, ipAddresses: ips, resolved: ips.length > 0 }
              : r
          );
          const resolved = updated.filter((r) => r.resolved).length;
          return {
            results: updated,
            progress: {
              ...state.progress,
              resolved,
              percent: Math.min(50 + (resolved / updated.length) * 50, 100),
            },
          };
        });
      } catch {
        // Ignore DNS resolution errors
      }
    }
  };
  
  const workers = Array(Math.min(concurrency, results.length))
    .fill(null)
    .map(() => worker());
  
  await Promise.all(workers);
}
