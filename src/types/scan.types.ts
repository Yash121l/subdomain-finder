export type ScanStatus = "idle" | "running" | "paused" | "completed" | "failed";

export type ScanResult = {
  id: string;
  subdomain: string;
  ipAddresses: string[];
  statusCode: number;
  responseTime: number;
  https: boolean;
  technologies: string[];
  active: boolean;
};

export type ScanProgress = {
  percent: number;
  found: number;
  speed: number;
  eta: number;
};
