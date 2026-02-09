import { z } from "zod";

export const scanSchema = z.object({
  domain: z
    .string()
    .min(3, "Domain is required")
    .regex(/^(?!-)(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,}$/, "Enter a valid domain"),
  wordlist: z.string().min(1, "Select a wordlist"),
  threads: z.number().min(1).max(100),
  timeout: z.number().min(1).max(30)
});

export type ScanFormValues = z.infer<typeof scanSchema>;
