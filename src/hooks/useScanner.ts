import { useCallback } from "react";
import { useScanStore } from "../store/scanStore";

export function useScanner() {
  const { startScan, pauseScan, stopScan } = useScanStore();

  const onStart = useCallback(() => {
    startScan();
  }, [startScan]);

  const onPause = useCallback(() => {
    pauseScan();
  }, [pauseScan]);

  const onStop = useCallback(() => {
    stopScan();
  }, [stopScan]);

  return { onStart, onPause, onStop };
}
