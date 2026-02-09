import { Button } from "../ui/button";
import { useScanStore } from "../../store/scanStore";
import { Pause, Play, Square, Trash2 } from "lucide-react";

export function ScanControls() {
  const status = useScanStore((state) => state.status);
  const pauseScan = useScanStore((state) => state.pauseScan);
  const resumeScan = useScanStore((state) => state.resumeScan);
  const stopScan = useScanStore((state) => state.stopScan);
  const clearResults = useScanStore((state) => state.clearResults);

  const isRunning = status === "running";
  const isPaused = status === "paused";
  const isActive = isRunning || isPaused;

  return (
    <div className="flex flex-wrap gap-2">
      {isRunning && (
        <Button variant="secondary" size="sm" onClick={pauseScan}>
          <Pause className="h-4 w-4" />
          Pause
        </Button>
      )}
      
      {isPaused && (
        <Button variant="secondary" size="sm" onClick={resumeScan}>
          <Play className="h-4 w-4" />
          Resume
        </Button>
      )}
      
      {isActive && (
        <Button variant="danger" size="sm" onClick={stopScan}>
          <Square className="h-4 w-4" />
          Stop
        </Button>
      )}
      
      {!isActive && status !== "idle" && (
        <Button variant="ghost" size="sm" onClick={clearResults}>
          <Trash2 className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
