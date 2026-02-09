import { forwardRef } from "react";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading, children, disabled, ...props },
    ref
  ) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
      primary: "bg-[var(--color-accent)] text-[var(--color-bg)] hover:opacity-90 focus:ring-[var(--color-accent)]/50 focus:ring-offset-[var(--color-bg)]",
      secondary: "bg-[var(--color-bg-tertiary)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-border)]",
      ghost: "bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-tertiary)]",
      outline: "bg-transparent border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-tertiary)]",
      danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20",
    };

    const sizes = {
      sm: "h-9 px-3 text-sm gap-1.5",
      md: "h-11 px-5 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
