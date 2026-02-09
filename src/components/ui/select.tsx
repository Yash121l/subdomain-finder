import { cn } from "../../lib/utils";
import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "w-full appearance-none rounded-lg px-4 py-2.5 pr-10",
            "bg-slate-900/60 text-slate-100",
            "border border-slate-700/50",
            "transition-all duration-200",
            "hover:border-slate-600/50",
            "focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      </div>
    );
  }
);

Select.displayName = "Select";
