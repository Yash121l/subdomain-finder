import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { scanSchema, type ScanFormValues } from "../../lib/validators";
import { SOURCE_OPTIONS } from "../../lib/constants";
import { useScanStore } from "../../store/scanStore";
import { Globe, Search, Zap } from "lucide-react";

type Props = {
  initialDomain?: string;
  onScanStart?: (domain: string) => void;
};

export function ScanForm({ initialDomain, onScanStart }: Props) {
  const startScan = useScanStore((state) => state.startScan);
  const status = useScanStore((state) => state.status);
  const isRunning = status === "running";
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ScanFormValues>({
    resolver: zodResolver(scanSchema),
    defaultValues: {
      domain: initialDomain || "",
      sources: ["all"],
      resolveDns: true,
      concurrency: 10,
      timeout: 5
    }
  });

  // Update form when initialDomain changes (from URL)
  useEffect(() => {
    if (initialDomain) {
      setValue("domain", initialDomain);
    }
  }, [initialDomain, setValue]);

  const concurrency = watch("concurrency");
  const resolveDns = watch("resolveDns");

  const onSubmit = (data: ScanFormValues) => {
    // Update URL with domain
    onScanStart?.(data.domain);
    
    startScan({
      domain: data.domain,
      sources: data.sources,
      resolveDns: data.resolveDns,
      concurrency: data.concurrency,
      timeout: data.timeout,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Domain Input */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
          <Globe className="h-4 w-4 text-indigo-400" />
          Target Domain
        </label>
        <Input
          placeholder="example.com"
          {...register("domain")}
          disabled={isRunning}
          className="text-lg"
        />
        {errors.domain && (
          <p className="text-xs text-rose-400">{errors.domain.message}</p>
        )}
      </div>

      {/* Source Selection */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
          <Search className="h-4 w-4 text-purple-400" />
          OSINT Sources
        </label>
        <Select {...register("sources.0")} disabled={isRunning}>
          {SOURCE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <p className="text-xs text-slate-500">
          Uses Certificate Transparency logs and DNS search APIs
        </p>
      </div>

      {/* DNS Resolution Toggle */}
      <div className="flex items-center justify-between rounded-lg bg-slate-900/40 p-3">
        <div>
          <p className="text-sm font-medium text-slate-200">DNS Resolution</p>
          <p className="text-xs text-slate-500">Resolve IP addresses for discovered subdomains</p>
        </div>
        <Switch
          checked={resolveDns}
          onChange={(e) => setValue("resolveDns", e.target.checked)}
          disabled={isRunning}
        />
      </div>

      {/* Concurrency Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-slate-200">
          <span className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            Concurrency
          </span>
          <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-medium text-indigo-300">
            {concurrency}
          </span>
        </div>
        <Slider
          min={1}
          max={50}
          value={concurrency}
          onChange={(event) => setValue("concurrency", Number(event.target.value))}
          disabled={isRunning}
        />
        <p className="text-xs text-slate-500">
          Higher values = faster scanning, but may hit rate limits
        </p>
      </div>

      {/* Hidden timeout input with default value */}
      <input type="hidden" {...register("timeout")} value={5} />

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-12 text-base"
        disabled={isSubmitting || isRunning}
        loading={isRunning}
      >
        {isRunning ? "Scanning..." : "Start Discovery"}
      </Button>
    </form>
  );
}
