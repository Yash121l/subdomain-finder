import type { ScanResult } from "./scan.types";

export type ScanStartResponse = {
  scanId: string;
};

export type ScanResultsResponse = {
  scanId: string;
  results: ScanResult[];
};
