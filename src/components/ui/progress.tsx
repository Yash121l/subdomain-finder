import { cn } from "../../lib/utils";

type ProgressProps = {
  value: number;
  max?: number;
  className?: string;
  variant?: "default" | "gradient";
  showLabel?: boolean;
};

export function Progress({
  value,
  max = 100,
  className,
  variant = "gradient",
  showLabel = false,
}: ProgressProps) {
  const percent = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("relative", className)}>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800/60">
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out",
            variant === "gradient"
              ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500"
              : "bg-indigo-500",
            percent > 0 && "animate-pulse-glow"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-slate-400">
          {Math.round(percent)}%
        </span>
      )}
    </div>
  );
}
