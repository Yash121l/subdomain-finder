import { useScanStore } from "../../store/scanStore";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";
import { formatDuration } from "../../lib/utils";
import { Activity, Clock, Database, Globe } from "lucide-react";

export function ScanProgress() {
  const status = useScanStore((state) => state.status);
  const progress = useScanStore((state) => state.progress);
  const results = useScanStore((state) => state.results);
  
  if (status === "idle") {
    return (
      <Card className="text-center py-8" hover={false}>
        <Globe className="mx-auto h-12 w-12 text-slate-600 mb-3" />
        <p className="text-slate-400">Enter a domain and start scanning</p>
        <p className="text-xs text-slate-600 mt-1">
          Searches Certificate Transparency logs and DNS records
        </p>
      </Card>
    );
  }

  const elapsed = progress.startedAt 
    ? Math.floor((Date.now() - progress.startedAt) / 1000) 
    : 0;

  const statusColors = {
    running: "text-indigo-400",
    paused: "text-amber-400",
    completed: "text-emerald-400",
    failed: "text-rose-400",
    idle: "text-slate-400",
  };

  return (
    <Card hover={false}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className={`h-5 w-5 ${statusColors[status]} ${status === "running" ? "animate-pulse" : ""}`} />
            <span className="font-semibold text-slate-200 capitalize">{status}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-slate-400">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(elapsed)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <Progress value={progress.percent} />

        {/* Status Message */}
        <p className="text-sm text-slate-400 line-clamp-1">
          {progress.message}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-slate-900/50 p-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Database className="h-3.5 w-3.5" />
              Discovered
            </div>
            <p className="text-2xl font-bold text-gradient">
              {results.length}
            </p>
          </div>
          <div className="rounded-lg bg-slate-900/50 p-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Globe className="h-3.5 w-3.5" />
              Resolved
            </div>
            <p className="text-2xl font-bold text-emerald-400">
              {progress.resolved}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
