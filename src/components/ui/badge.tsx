import { cn } from "../../lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
  className?: string;
};

const variants = {
  default: "bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/20",
  success: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20",
  warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  error: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
  info: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
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
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
