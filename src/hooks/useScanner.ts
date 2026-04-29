import { useScanStore } from "../store/scanStore";
import type { ScanConfig } from "../store/scanStore";

export function useScanner() {
  const { startScan, pauseScan, stopScan } = useScanStore();
  return { startScan, pauseScan, stopScan };
}

export type { ScanConfig };
