export type ScanStatus = "idle" | "running" | "paused" | "completed" | "failed";
export type ScanOutcome = "success" | "partial" | "failed";
export type SourceRunStatus = "running" | "succeeded" | "failed" | "rate_limited";

export type SourceProgress = {
  source: string;
  status: SourceRunStatus;
  message: string;
  count: number;
};

export type ScanResult = {
  id: string;
  subdomain: string;
  ipAddresses: string[];
  statusCode: number | null;
  responseTime: number | null;
  https: boolean;
  source: string;
  resolved: boolean;
  discoveredAt: number;
};

export type ScanProgress = {
  percent: number;
  found: number;
  resolved: number;
  currentSource: string;
  message: string;
  startedAt: number | null;
  endedAt: number | null;
};
