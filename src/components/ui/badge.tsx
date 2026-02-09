import { cn } from "../../lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
  className?: string;
  glow?: boolean;
};

const variants = {
  default: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  success: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  warning: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  error: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  info: "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

const sizes = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
};

export function Badge({
  children,
  variant = "default",
  size = "md",
  className,
  glow = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        variants[variant],
        sizes[size],
        glow && variant === "success" && "shadow-sm shadow-emerald-500/30",
        glow && variant === "error" && "shadow-sm shadow-rose-500/30",
        className
      )}
    >
      {children}
    </span>
  );
}
