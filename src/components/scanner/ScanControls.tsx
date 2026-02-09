import { Pause, Play, Square } from "lucide-react";
import { Button } from "../ui/button";
import { useScanStore } from "../../store/scanStore";

export function ScanControls() {
  const { status, startScan, pauseScan, stopScan } = useScanStore();

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="primary" onClick={startScan}>
        <Play size={16} className="mr-2" />
        Start
      </Button>
      <Button variant="secondary" onClick={pauseScan} disabled={status !== "running"}>
        <Pause size={16} className="mr-2" />
        Pause
      </Button>
      <Button variant="outline" onClick={stopScan}>
        <Square size={16} className="mr-2" />
        Stop
      </Button>
    </div>
  );
}
