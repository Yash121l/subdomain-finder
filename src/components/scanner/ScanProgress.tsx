import { Card } from "../ui/card";
import { Progress } from "../ui/progress";
import { formatDuration, formatNumber } from "../../lib/utils";
import { useScanStore } from "../../store/scanStore";

export function ScanProgress() {
  const progress = useScanStore((state) => state.progress);

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">Scan progress</p>
        <span className="text-xs font-semibold text-primary-300">{progress.percent}%</span>
      </div>
      <Progress value={progress.percent} />
      <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs text-slate-500">Subdomains found</p>
          <p className="text-lg font-semibold text-white">{formatNumber(progress.found)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Speed</p>
          <p className="text-lg font-semibold text-white">{formatNumber(progress.speed)} / sec</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">ETA</p>
          <p className="text-lg font-semibold text-white">{formatDuration(progress.eta)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Jobs queued</p>
          <p className="text-lg font-semibold text-white">2,340</p>
        </div>
      </div>
    </Card>
  );
}
