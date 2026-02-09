import * as React from "react";
import { cn } from "../../lib/utils";

type SwitchProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Switch({ className, ...props }: SwitchProps) {
  return (
    <label className={cn("relative inline-flex cursor-pointer items-center", className)}>
      <input type="checkbox" className="peer sr-only" {...props} />
      <span className="h-6 w-10 rounded-full bg-[var(--color-border)] transition peer-checked:bg-blue-500" />
      <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition peer-checked:translate-x-4 dark:bg-gray-200" />
    </label>
  );
}
