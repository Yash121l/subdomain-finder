import { beforeEach, describe, expect, it, vi } from "vitest";
import { useScanStore, type ScanConfig } from "./scanStore";
import { getScanResults, openScanStream } from "../lib/services/scanApiService";

vi.mock("../lib/services/scanApiService", () => ({
  getScanResults: vi.fn(),
  openScanStream: vi.fn(() => () => undefined),
  triggerRefresh: vi.fn(() => Promise.resolve()),
}));

const config: ScanConfig = {
  domain: "example.com",
  sources: ["all"],
  resolveDns: true,
  concurrency: 10,
  timeout: 5,
};

describe("scanStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useScanStore.getState().clearResults();
  });

  it("keeps stale results visible while opening a refresh stream", async () => {
    vi.mocked(getScanResults).mockResolvedValue({
      cacheStatus: "STALE",
      cacheAge: 90_000,
      data: {
        results: [
          {
            subdomain: "api.example.com",
            ipAddresses: ["203.0.113.10"],
            source: "certspotter",
            resolved: true,
            discoveredAt: 1,
          },
        ],
        meta: { fetchedAt: Date.now() - 90_000, status: "STALE" },
      },
    });

    await useScanStore.getState().startScan(config);

    expect(useScanStore.getState().status).toBe("running");
    expect(useScanStore.getState().isRefreshing).toBe(true);
    expect(useScanStore.getState().results).toHaveLength(1);
    expect(openScanStream).toHaveBeenCalledOnce();
  });

  it("marks fatal stream errors as failed without cached results", async () => {
    vi.mocked(getScanResults).mockResolvedValue({
      cacheStatus: "MISS",
      cacheAge: null,
      data: { results: [], meta: { fetchedAt: null, status: "MISS" } },
    });
    vi.mocked(openScanStream).mockImplementation((_domain, options) => {
      options.onEvent({
        event: "error",
        message: "All selected sources failed or were rate limited. No results were cached.",
        fatal: true,
      });
      return () => undefined;
    });

    await useScanStore.getState().startScan(config);

    expect(useScanStore.getState().status).toBe("failed");
    expect(useScanStore.getState().outcome).toBe("failed");
    expect(useScanStore.getState().lastError).toContain("All selected sources failed");
  });
});
