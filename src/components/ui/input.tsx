import { forwardRef } from "react";
import { cn } from "../../lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-lg border px-4 py-3",
          "text-sm transition-all duration-200",
          "border-[var(--color-border)] bg-[var(--color-bg-tertiary)]",
          "text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]",
          "focus:outline-none focus:border-[var(--color-text-secondary)] focus:ring-1 focus:ring-[var(--color-text-secondary)]/30",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
