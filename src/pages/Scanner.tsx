import { Card } from "../components/ui/card";
import { ScanForm } from "../components/scanner/ScanForm";
import { ScanControls } from "../components/scanner/ScanControls";
import { ScanProgress } from "../components/scanner/ScanProgress";
import { ResultsFilters } from "../components/results/ResultsFilters";
import { ResultsTable } from "../components/results/ResultsTable";
import { ExportButtons } from "../components/results/ExportButtons";

export function Scanner() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <Card>
          <h2 className="text-lg font-semibold text-white">Start new scan</h2>
          <p className="mt-2 text-sm text-slate-400">
            Configure your scan parameters and launch a multi-threaded subdomain discovery sweep.
          </p>
          <div className="mt-6">
            <ScanForm />
          </div>
        </Card>
        <div className="space-y-4">
          <ScanProgress />
          <Card>
            <h3 className="text-sm font-semibold text-slate-200">Controls</h3>
            <p className="mt-1 text-xs text-slate-500">Pause or stop the active scan at any time.</p>
            <div className="mt-4">
              <ScanControls />
            </div>
          </Card>
        </div>
      </div>

      <Card className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Live results</h3>
            <p className="text-sm text-slate-400">Streaming subdomain discoveries and response metadata.</p>
          </div>
          <ExportButtons />
        </div>
        <ResultsFilters />
        <ResultsTable />
      </Card>
    </div>
  );
}
