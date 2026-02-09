import { cn } from "../../lib/utils";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
};

export function Card({ children, className, hover = true }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-6 transition-colors",
        "border-[var(--color-border)] bg-[var(--color-bg-secondary)]",
        hover && "hover-lift",
        className
      )}
    >
      {children}
    </div>
  );
}
