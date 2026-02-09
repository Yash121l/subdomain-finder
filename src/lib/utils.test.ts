import { describe, expect, it } from "vitest";
import { formatDuration, formatNumber } from "./utils";

describe("utils", () => {
  it("formats durations", () => {
    expect(formatDuration(45)).toBe("45s");
    expect(formatDuration(75)).toBe("1m 15s");
  });

  it("formats numbers with grouping", () => {
    expect(formatNumber(12000)).toBe("12,000");
  });
});
