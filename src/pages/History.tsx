import { Card } from "../components/ui/card";
import { HistoryFilters } from "../components/history/HistoryFilters";
import { HistoryTable } from "../components/history/HistoryTable";

export function History() {
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">Scan history</h2>
        <p className="text-sm text-slate-400">Review previous scans and export results.</p>
      </div>
      <HistoryFilters />
      <HistoryTable />
    </Card>
  );
}
