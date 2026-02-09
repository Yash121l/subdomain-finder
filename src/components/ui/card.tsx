import * as React from "react";
import { cn } from "../../lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-800 bg-slate-950/60 p-6 shadow-lg shadow-slate-950/30",
        className
      )}
      {...props}
    />
  );
}
