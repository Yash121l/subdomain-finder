import { useEffect, useState } from "react";
import { useScanStore } from "../../store/scanStore";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";
import { formatDuration } from "../../lib/utils";
import { Activity, AlertTriangle, CheckCircle2, Clock, Database, Globe, Loader2, XCircle } from "lucide-react";

export function ScanProgress() {
  const status = useScanStore((state) => state.status);
  const outcome = useScanStore((state) => state.outcome);
  const progress = useScanStore((state) => state.progress);
  const results = useScanStore((state) => state.results);
  const sourceStatuses = useScanStore((state) => state.sourceStatuses);
  const lastError = useScanStore((state) => state.lastError);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (status === "running") {
      setNow(Date.now());
      interval = setInterval(() => setNow(Date.now()), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);

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
    ? Math.floor(((progress.endedAt || now) - progress.startedAt) / 1000) 
    : 0;

  const statusColors = {
    running: "text-blue-500",
    paused: "text-amber-500",
    completed: "text-green-500",
    failed: "text-red-500",
    idle: "text-[var(--color-text-muted)]",
  };

  const sourceIcon = (sourceStatus: string) => {
    if (sourceStatus === "running") return <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />;
    if (sourceStatus === "succeeded") return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />;
    if (sourceStatus === "rate_limited") return <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />;
    return <XCircle className="h-3.5 w-3.5 text-red-500" />;
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

        {outcome === "partial" && (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
            Some sources failed or were rate limited. Results shown are partial.
          </div>
        )}

        {lastError && status === "failed" && (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-400">
            {lastError}
          </div>
        )}

        {sourceStatuses.length > 0 && (
          <div className="space-y-2 rounded-lg bg-[var(--color-bg-tertiary)] p-3">
            <p className="text-xs font-medium uppercase text-[var(--color-text-muted)]">Sources</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {sourceStatuses.map((source) => (
                <div key={source.source} className="flex min-w-0 items-center justify-between gap-2 text-xs">
                  <span className="flex min-w-0 items-center gap-1.5 text-[var(--color-text-secondary)]">
                    {sourceIcon(source.status)}
                    <span className="truncate">{source.source}</span>
                  </span>
                  <span className="shrink-0 font-medium text-[var(--color-text)]">
                    {source.status === "succeeded" ? source.count : source.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

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
