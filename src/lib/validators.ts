import { z } from "zod";
import type { OsintSource } from "../types/osint.types";

export const scanSchema = z.object({
  domain: z
    .string()
    .min(3, "Domain is required")
    .regex(/^(?!-)(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,}$/, "Enter a valid domain"),
  sources: z.array(z.enum(["crtsh", "hackertarget", "all"])).min(1, "Select at least one source"),
  resolveDns: z.boolean(),
  concurrency: z.number().min(1).max(50),
  timeout: z.number().min(1).max(30)
});

export type ScanFormValues = z.infer<typeof scanSchema> & {
  sources: OsintSource[];
};
