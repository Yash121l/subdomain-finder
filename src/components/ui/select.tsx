import * as React from "react";
import { cn } from "../../lib/utils";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100",
      "focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30",
      className
    )}
    {...props}
  />
));
Select.displayName = "Select";
