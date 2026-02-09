import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { useScanStore } from "../../store/scanStore";
import { Activity, Database, Globe, Zap } from "lucide-react";

export function Sidebar() {
  const status = useScanStore((state) => state.status);
  const results = useScanStore((state) => state.results);
  const progress = useScanStore((state) => state.progress);

  const statusBadge = {
    idle: { variant: "default" as const, label: "Idle" },
    running: { variant: "success" as const, label: "Running" },
    paused: { variant: "warning" as const, label: "Paused" },
    completed: { variant: "info" as const, label: "Complete" },
    failed: { variant: "error" as const, label: "Failed" },
  };

  const uniqueSources = [...new Set(results.map((r) => r.source))];
  const resolvedCount = results.filter((r) => r.resolved).length;

  return (
    <aside className="hidden w-72 flex-col gap-4 xl:flex">
      {/* Status Card */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Activity className={`h-4 w-4 ${status === "running" ? "text-emerald-400 animate-pulse" : "text-slate-500"}`} />
          <span className="text-xs uppercase tracking-widest text-slate-500 font-medium">Status</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">Current scan</span>
          <Badge variant={statusBadge[status].variant} glow={status === "running"}>
            {statusBadge[status].label}
          </Badge>
        </div>
      </Card>

      {/* Stats Card */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Database className="h-4 w-4 text-indigo-400" />
          <span className="text-xs uppercase tracking-widest text-slate-500 font-medium">Statistics</span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Discovered</span>
            <span className="text-lg font-bold text-gradient">{results.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Resolved</span>
            <span className="text-lg font-semibold text-emerald-400">{resolvedCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Progress</span>
            <span className="text-sm font-medium text-slate-300">{progress.percent}%</span>
          </div>
        </div>
      </Card>

      {/* Sources Card */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-4 w-4 text-purple-400" />
          <span className="text-xs uppercase tracking-widest text-slate-500 font-medium">OSINT Sources</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg bg-slate-900/50 p-2">
            <span className="text-xs text-slate-400">crt.sh</span>
            <span className="text-xs text-slate-500">Certificate Transparency</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-slate-900/50 p-2">
            <span className="text-xs text-slate-400">HackerTarget</span>
            <span className="text-xs text-slate-500">DNS Search</span>
          </div>
        </div>
        {uniqueSources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-800/50">
            <p className="text-xs text-slate-500 mb-2">Active sources:</p>
            <div className="flex flex-wrap gap-1">
              {uniqueSources.map((source) => (
                <Badge key={source} size="sm" variant="info">
                  {source === "crtsh" ? "CT" : source === "hackertarget" ? "DNS" : source}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Tips Card */}
      <Card className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-amber-400" />
          <span className="text-xs uppercase tracking-widest text-slate-500 font-medium">Pro Tip</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Certificate Transparency logs are a goldmine for finding subdomains. 
          They contain all SSL certificates ever issued for a domain.
        </p>
      </Card>
    </aside>
  );
}
