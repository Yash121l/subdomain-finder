import { describe, expect, it } from "vitest";
import { normalizeDiscoveredHostname } from "./osintService";

describe("normalizeDiscoveredHostname", () => {
  it("strips wildcards and keeps valid subdomains", () => {
    expect(normalizeDiscoveredHostname("*.api.example.com", "example.com")).toBe("api.example.com");
    expect(normalizeDiscoveredHostname("HTTPS://Admin.Example.com/login", "example.com")).toBe("admin.example.com");
  });

  it("rejects root domains unless explicitly allowed", () => {
    expect(normalizeDiscoveredHostname("example.com", "example.com")).toBeNull();
    expect(normalizeDiscoveredHostname("example.com", "example.com", true)).toBe("example.com");
  });

  it("rejects malformed and out-of-scope hosts", () => {
    expect(normalizeDiscoveredHostname("bad host.example.com", "example.com")).toBeNull();
    expect(normalizeDiscoveredHostname("api.attacker.com", "example.com")).toBeNull();
    expect(normalizeDiscoveredHostname("-bad.example.com", "example.com")).toBeNull();
  });
});
