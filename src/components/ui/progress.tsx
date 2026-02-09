import * as React from "react";
import { cn } from "../../lib/utils";

type ProgressProps = {
  value: number;
  className?: string;
};

export function Progress({ value, className }: ProgressProps) {
  return (
    <div className={cn("h-2 w-full rounded-full bg-slate-800", className)}>
      <div
        className="h-2 rounded-full bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
