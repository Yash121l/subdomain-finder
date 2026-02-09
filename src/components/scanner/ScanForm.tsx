import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Slider } from "../ui/slider";
import { scanSchema, type ScanFormValues } from "../../lib/validators";
import { WORDLIST_OPTIONS } from "../../lib/constants";
import { useScanStore } from "../../store/scanStore";
import { AdvancedOptions } from "./AdvancedOptions";

export function ScanForm() {
  const startScan = useScanStore((state) => state.startScan);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ScanFormValues>({
    resolver: zodResolver(scanSchema),
    defaultValues: {
      domain: "",
      wordlist: "common",
      threads: 32,
      timeout: 5
    }
  });

  const threads = watch("threads");

  const onSubmit = () => {
    startScan();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200">Target domain</label>
        <Input placeholder="example.com" {...register("domain")} />
        {errors.domain && <p className="text-xs text-rose-300">{errors.domain.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200">Wordlist</label>
        <Select {...register("wordlist")}>
          {WORDLIST_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-slate-200">
          <span>Thread count</span>
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs">{threads}</span>
        </div>
        <Slider
          min={1}
          max={100}
          value={threads}
          onChange={(event) => setValue("threads", Number(event.target.value))}
        />
        {errors.threads && <p className="text-xs text-rose-300">{errors.threads.message}</p>}
      </div>

      <AdvancedOptions register={register} />

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        Start Scan
      </Button>
    </form>
  );
}
