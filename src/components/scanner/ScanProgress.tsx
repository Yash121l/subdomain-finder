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
        <Globe className="mx-auto h-12 w-12 text-[var(--color-text-muted)] mb-3" />
        <p className="text-[var(--color-text-secondary)]">Enter a domain and start scanning</p>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          Searches Certificate Transparency logs and DNS records
        </p>
      </Card>
    );
  }

  const elapsed = progress.startedAt 
    ? Math.floor((Date.now() - progress.startedAt) / 1000) 
    : 0;

  const statusColors = {
    running: "text-blue-500",
    paused: "text-amber-500",
    completed: "text-green-500",
    failed: "text-red-500",
    idle: "text-[var(--color-text-muted)]",
  };

  return (
    <Card hover={false}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className={`h-5 w-5 ${statusColors[status]} ${status === "running" ? "animate-pulse" : ""}`} />
            <span className="font-semibold text-[var(--color-text)] capitalize">{status}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)]">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(elapsed)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <Progress value={progress.percent} />

        {/* Status Message */}
        <p className="text-sm text-[var(--color-text-secondary)] line-clamp-1">
          {progress.message}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-[var(--color-bg-tertiary)] p-3">
            <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-1">
              <Database className="h-3.5 w-3.5" />
              Discovered
            </div>
            <p className="text-2xl font-bold text-[var(--color-text)]">
              {results.length}
            </p>
          </div>
          <div className="rounded-lg bg-[var(--color-bg-tertiary)] p-3">
            <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-1">
              <Globe className="h-3.5 w-3.5" />
              Resolved
            </div>
            <p className="text-2xl font-bold text-green-500">
              {progress.resolved}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
