import * as React from "react";
import { cn } from "../../lib/utils";

type SliderProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Slider({ className, ...props }: SliderProps) {
  return (
    <input
      type="range"
      className={cn(
        "h-2 w-full cursor-pointer appearance-none rounded-full",
        "bg-[var(--color-border)]",
        "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4",
        "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500",
        "[&::-webkit-slider-thumb]:cursor-pointer",
        "[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4",
        "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-500",
        "[&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer",
        className
      )}
      {...props}
    />
  );
}
