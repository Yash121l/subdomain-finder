import { cn } from "../../lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-lg px-4 py-2.5",
          "bg-slate-900/60 text-slate-100 placeholder-slate-500",
          "border border-slate-700/50",
          "transition-all duration-200",
          "hover:border-slate-600/50",
          "focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20",
          "focus:bg-slate-900/80",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
