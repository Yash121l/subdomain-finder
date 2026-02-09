import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { ScanForm } from "../components/scanner/ScanForm";
import { ScanControls } from "../components/scanner/ScanControls";
import { ScanProgress } from "../components/scanner/ScanProgress";
import { ResultsTable } from "../components/results/ResultsTable";
import { ExportButtons } from "../components/results/ExportButtons";
import { useScanStore } from "../store/scanStore";
import { Radar, Download } from "lucide-react";

export function Scanner() {
  const { domain } = useParams<{ domain?: string }>();
  const navigate = useNavigate();
  const startScan = useScanStore((state) => state.startScan);
  const status = useScanStore((state) => state.status);
  const hasAutoStarted = useRef(false);

  // Auto-start scan when domain is in URL
  useEffect(() => {
    if (domain && status === "idle" && !hasAutoStarted.current) {
      hasAutoStarted.current = true;
      startScan({
        domain,
        sources: ["all"],
        resolveDns: true,
        concurrency: 10,
        timeout: 5,
      });
    }
  }, [domain, status, startScan]);

  // Update URL when scan completes (for sharing)
  const updateUrl = (newDomain: string) => {
    navigate(`/scan/${encodeURIComponent(newDomain)}`, { replace: true });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Section - Form + Progress */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Scan Form Card */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
              <Radar className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">New Scan</h2>
              <p className="text-xs text-slate-500">
                Discover subdomains using OSINT sources
              </p>
            </div>
          </div>
          <ScanForm initialDomain={domain} onScanStart={updateUrl} />
        </Card>

        {/* Progress & Controls */}
        <div className="space-y-4">
          <ScanProgress />
          <Card hover={false}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Controls</h3>
                <p className="text-xs text-slate-500">Pause or stop the active scan</p>
              </div>
              <ScanControls />
            </div>
          </Card>
        </div>
      </div>

      {/* Results Section */}
      <Card className="space-y-4" hover={false}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Download className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Results</h3>
              <p className="text-xs text-slate-500">Discovered subdomains and DNS data</p>
            </div>
          </div>
          <ExportButtons />
        </div>
        <ResultsTable />
      </Card>
    </div>
  );
}
