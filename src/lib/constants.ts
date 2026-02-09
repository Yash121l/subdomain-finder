import type { OsintSource } from "../types/osint.types";

export const SOURCE_OPTIONS: { label: string; value: OsintSource }[] = [
  { label: "All Sources", value: "all" },
  { label: "crt.sh (Certificate Transparency)", value: "crtsh" },
  { label: "HackerTarget (DNS Search)", value: "hackertarget" },
];

export const STATUS_OPTIONS = ["200", "301", "302", "403", "404", "500"];

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  "200": { bg: "bg-emerald-500/20", text: "text-emerald-400" },
  "301": { bg: "bg-amber-500/20", text: "text-amber-400" },
  "302": { bg: "bg-amber-500/20", text: "text-amber-400" },
  "403": { bg: "bg-rose-500/20", text: "text-rose-400" },
  "404": { bg: "bg-slate-500/20", text: "text-slate-400" },
  "500": { bg: "bg-red-500/20", text: "text-red-400" },
  default: { bg: "bg-slate-500/20", text: "text-slate-400" },
};

export const CONCURRENCY_PRESETS = [
  { label: "Low (5)", value: 5 },
  { label: "Medium (15)", value: 15 },
  { label: "High (30)", value: 30 },
  { label: "Max (50)", value: 50 },
];
