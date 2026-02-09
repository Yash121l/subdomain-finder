export type ScanStatus = "idle" | "running" | "paused" | "completed" | "failed";

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
};
