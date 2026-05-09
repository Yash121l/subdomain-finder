import { RefreshCw, Clock } from "lucide-react";
import { useScanStore } from "../../store/scanStore";

function formatAge(cachedAt: number): string {
  const diffMs = Date.now() - cachedAt;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} day${days !== 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  return "less than an hour ago";
}

export function StaleCacheBanner() {
  const cacheStatus = useScanStore((s) => s.cacheStatus);
  const cachedAt = useScanStore((s) => s.cachedAt);
  const isRefreshing = useScanStore((s) => s.isRefreshing);
  const forceRefresh = useScanStore((s) => s.forceRefresh);

  if (cacheStatus !== "STALE") return null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm">
      <Clock className="h-4 w-4 shrink-0 text-yellow-500" />
      <span className="text-[var(--color-text-muted)] flex-1">
        Showing cached results from{" "}
        <span className="text-[var(--color-text)] font-medium">
          {cachedAt ? formatAge(cachedAt) : "a while ago"}
        </span>
        {isRefreshing ? " — refreshing in background..." : "."}
      </span>
      {!isRefreshing && (
        <button
          onClick={forceRefresh}
          className="flex items-center gap-1.5 rounded-md bg-yellow-500/20 px-3 py-1 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/30 transition-colors font-medium"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Now
        </button>
      )}
      {isRefreshing && (
        <span className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-400">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          Refreshing…
        </span>
      )}
    </div>
  );
}
