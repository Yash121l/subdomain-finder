import { cn } from "../../lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  loading?: boolean;
};

const variants: Record<Variant, string> = {
  primary: cn(
    "bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500",
    "text-white font-semibold",
    "hover:from-indigo-400 hover:via-purple-400 hover:to-fuchsia-400",
    "shadow-lg shadow-indigo-500/25",
    "hover:shadow-xl hover:shadow-indigo-500/30",
    "active:scale-[0.98]"
  ),
  secondary: cn(
    "bg-slate-800/80 text-slate-200",
    "hover:bg-slate-700/80",
    "border border-slate-700/50"
  ),
  ghost: cn(
    "text-slate-400 hover:text-slate-200",
    "hover:bg-slate-800/50"
  ),
  outline: cn(
    "border border-slate-700/50 text-slate-300",
    "hover:border-indigo-500/50 hover:text-indigo-300",
    "hover:bg-indigo-500/5"
  ),
  danger: cn(
    "bg-rose-500/10 text-rose-300",
    "hover:bg-rose-500/20",
    "border border-rose-500/30"
  ),
};

const sizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  loading = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 rounded-lg font-medium",
        "transition-all duration-200 ease-out",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && (
        <Loader2 className="h-4 w-4 spinner" />
      )}
      {children}
    </button>
  );
}
