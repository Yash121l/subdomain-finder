import { describe, expect, it, vi } from "vitest";
import type { Env, SourceRunResult } from "../types";
import type { OsintCallbacks, OsintSource } from "./osintService";
import { performFullScan, ScanSourcesFailedError } from "./scanRunner";

function createEnv() {
  const store = new Map<string, string>();
  const kv = {
    get: vi.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
    put: vi.fn((key: string, value: string) => {
      store.set(key, value);
      return Promise.resolve();
    }),
  };

  return {
    env: { SCAN_CACHE: kv } as unknown as Env,
    kv,
  };
}

const failedSource: SourceRunResult = {
  source: "crtsh",
  status: "failed",
  count: 0,
  message: "crt.sh failed: HTTP 502",
  durationMs: 10,
};

const successfulSource: SourceRunResult = {
  source: "certspotter",
  status: "succeeded",
  count: 1,
  message: "Found 1 subdomains from Cert Spotter",
  durationMs: 10,
};

describe("performFullScan", () => {
  it("does not cache when every selected source fails", async () => {
    const { env, kv } = createEnv();
    const events: unknown[] = [];
    const osintRunner = vi.fn(async () => [failedSource]);

    await expect(
      performFullScan("example.com", ["crtsh"], env, (event) => events.push(event), { osintRunner })
    ).rejects.toBeInstanceOf(ScanSourcesFailedError);

    expect(kv.put).not.toHaveBeenCalled();
    expect(events).toContainEqual({
      event: "error",
      message: "All selected sources failed or were rate limited. No results were cached.",
      fatal: true,
    });
  });

  it("caches partial scans when at least one source succeeds", async () => {
    const { env, kv } = createEnv();
    const osintRunner = vi.fn(
      async (_domain: string, _sources: OsintSource[], callbacks: OsintCallbacks) => {
        await callbacks.onDiscovery([
          {
            subdomain: "api.example.com",
            ipAddresses: [],
            source: "certspotter",
            resolved: false,
            discoveredAt: 1,
          },
        ], "certspotter");
        return [failedSource, successfulSource];
      }
    );
    const dnsResolver = vi.fn(async () => new Map([["api.example.com", ["203.0.113.10"]]]));

    const entry = await performFullScan("example.com", [], env, undefined, { osintRunner, dnsResolver });

    expect(entry.totalFound).toBe(1);
    expect(entry.totalResolved).toBe(1);
    expect(entry.sourceStatuses).toHaveLength(2);
    expect(kv.put).toHaveBeenCalledOnce();
  });

  it("skips DNS resolution when requested", async () => {
    const { env } = createEnv();
    const osintRunner = vi.fn(
      async (_domain: string, _sources: OsintSource[], callbacks: OsintCallbacks) => {
        await callbacks.onDiscovery([
          {
            subdomain: "api.example.com",
            ipAddresses: [],
            source: "certspotter",
            resolved: false,
            discoveredAt: 1,
          },
        ], "certspotter");
        return [successfulSource];
      }
    );
    const dnsResolver = vi.fn(async () => new Map());

    const entry = await performFullScan("example.com", [], env, undefined, {
      resolveDns: false,
      osintRunner,
      dnsResolver,
    });

    expect(dnsResolver).not.toHaveBeenCalled();
    expect(entry.totalResolved).toBe(0);
  });
});
