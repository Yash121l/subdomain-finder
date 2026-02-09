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
            "bg-[var(--color-bg-tertiary)] text-[var(--color-text)]",
            "border border-[var(--color-border)]",
            "transition-all duration-200",
            "hover:border-[var(--color-border-light)]",
            "focus:border-[var(--color-text-secondary)] focus:ring-2 focus:ring-[var(--color-text-secondary)]/20",
            "focus:outline-none",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
      </div>
    );
  }
);

Select.displayName = "Select";
