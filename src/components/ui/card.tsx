import { cn } from "../../lib/utils";
import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
};

export function Card({ children, className, hover = true }: CardProps) {
  return (
    <div
      className={cn(
        "glass gradient-border rounded-xl p-6",
        "animate-fade-in",
        hover && "hover-lift",
        className
      )}
    >
      {children}
    </div>
  );
}
