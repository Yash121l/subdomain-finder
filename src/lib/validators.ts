import { z } from "zod";
import type { OsintSource } from "../types/osint.types";

function normalizeDomain(value: string): string {
  const trimmed = value.trim();
  // Strip protocol (http:// or https://)
  const withoutProtocol = trimmed.replace(/^https?:\/\//i, "");
  // Strip path, query string, and trailing slash — keep only the hostname
  const hostname = withoutProtocol.split("/")[0].split("?")[0].split("#")[0];
  return hostname.toLowerCase();
}

export const scanSchema = z.object({
  domain: z
    .string()
    .min(1, "Domain is required")
    .transform(normalizeDomain)
    .pipe(
      z
        .string()
        .min(3, "Domain is required")
        .regex(/^(?!-)(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,}$/, "Enter a valid domain")
    ),
  sources: z.array(z.enum(["crtsh", "hackertarget", "all"])).min(1, "Select at least one source"),
  resolveDns: z.boolean(),
  concurrency: z.number().min(1).max(50),
  timeout: z.number().min(1).max(30)
});

export type ScanFormValues = z.infer<typeof scanSchema> & {
  sources: OsintSource[];
};
