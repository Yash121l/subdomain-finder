import type { UseFormRegister } from "react-hook-form";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import type { ScanFormValues } from "../../lib/validators";

const resolvers = ["Cloudflare", "Google", "Quad9", "OpenDNS"];

export function AdvancedOptions({ register }: { register: UseFormRegister<ScanFormValues> }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Advanced options</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-slate-200">Timeout (seconds)</label>
          <Input type="number" min={1} max={30} {...register("timeout", { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-200">DNS resolver</label>
          <select className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm">
            {resolvers.map((resolver) => (
              <option key={resolver}>{resolver}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-200">Resolve IPs</p>
            <p className="text-xs text-slate-500">Map discovered subdomains.</p>
          </div>
          <Switch defaultChecked aria-label="Resolve IPs" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-200">HTTP/HTTPS probing</p>
            <p className="text-xs text-slate-500">Check response codes.</p>
          </div>
          <Switch defaultChecked aria-label="HTTP probing" />
        </div>
      </div>
    </div>
  );
}
