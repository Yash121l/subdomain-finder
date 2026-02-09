import { Card } from "../ui/card";
import { Badge } from "../ui/badge";

export function Sidebar() {
  return (
    <aside className="hidden w-72 flex-col gap-6 xl:flex">
      <Card>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Quick Stats</p>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Active scans</span>
            <Badge variant="success">1 running</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Queue depth</span>
            <span className="text-sm font-semibold">3 jobs</span>
          </div>
        </div>
      </Card>
      <Card>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Recent scans</p>
        <div className="mt-4 space-y-2 text-sm text-slate-300">
          <p>example.com · 3m ago</p>
          <p>corp.internal · 2h ago</p>
          <p>staging.app · 1d ago</p>
        </div>
      </Card>
      <Card>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Saved wordlists</p>
        <div className="mt-4 space-y-2 text-sm text-slate-300">
          <p>Common (1k)</p>
          <p>Extended (10k)</p>
          <p>Custom - Fintech</p>
        </div>
      </Card>
    </aside>
  );
}
