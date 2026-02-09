import { create } from "zustand";
import type { ScanProgress, ScanResult, ScanStatus } from "../types/scan.types";

const initialProgress: ScanProgress = {
  percent: 0,
  found: 0,
  speed: 0,
  eta: 0
};

const initialResults: ScanResult[] = [
  {
    id: "1",
    subdomain: "api.example.com",
    ipAddresses: ["192.168.10.21"],
    statusCode: 200,
    responseTime: 132,
    https: true,
    technologies: ["Nginx", "React"],
    active: true
  },
  {
    id: "2",
    subdomain: "dev.example.com",
    ipAddresses: ["192.168.10.24"],
    statusCode: 403,
    responseTime: 298,
    https: false,
    technologies: ["Apache"],
    active: false
  }
];

type ScanState = {
  status: ScanStatus;
  progress: ScanProgress;
  results: ScanResult[];
  startScan: () => void;
  pauseScan: () => void;
  stopScan: () => void;
};

export const useScanStore = create<ScanState>((set) => ({
  status: "idle",
  progress: initialProgress,
  results: initialResults,
  startScan: () =>
    set({
      status: "running",
      progress: {
        percent: 42,
        found: 128,
        speed: 88,
        eta: 120
      }
    }),
  pauseScan: () => set({ status: "paused" }),
  stopScan: () => set({ status: "completed", progress: initialProgress })
}));
