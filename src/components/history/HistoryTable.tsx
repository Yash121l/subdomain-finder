import { Table } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useHistoryStore } from "../../store/historyStore";

export function HistoryTable() {
  const entries = useHistoryStore((state) => state.entries);

  return (
    <Table>
      <thead className="bg-slate-900 text-xs uppercase text-slate-400">
        <tr>
          <th className="px-4 py-3">Domain</th>
          <th className="px-4 py-3">Date</th>
          <th className="px-4 py-3">Results</th>
          <th className="px-4 py-3">Duration</th>
          <th className="px-4 py-3">Status</th>
          <th className="px-4 py-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <tr key={entry.id} className="border-t border-slate-800">
            <td className="px-4 py-3 text-sm text-slate-200">{entry.domain}</td>
            <td className="px-4 py-3 text-xs text-slate-400">{entry.date}</td>
            <td className="px-4 py-3 text-xs text-slate-300">{entry.results}</td>
            <td className="px-4 py-3 text-xs text-slate-300">{entry.duration}</td>
            <td className="px-4 py-3">
              <Badge variant={entry.status === "completed" ? "success" : "danger"}>{entry.status}</Badge>
            </td>
            <td className="px-4 py-3">
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost">View</Button>
                <Button variant="ghost">Re-run</Button>
                <Button variant="ghost">Export</Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
