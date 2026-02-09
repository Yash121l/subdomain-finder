import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: Array<string | undefined | false>) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number) {
  if (seconds <= 0) return "0s";
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}m ${remaining}s`;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}
