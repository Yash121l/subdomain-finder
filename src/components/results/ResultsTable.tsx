import { Table } from "../ui/table";
import { useScanStore } from "../../store/scanStore";
import { ResultRow } from "./ResultRow";

export function ResultsTable() {
  const results = useScanStore((state) => state.results);

  return (
    <Table>
      <thead className="bg-slate-900 text-xs uppercase text-slate-400">
        <tr>
          <th className="px-4 py-3">Subdomain</th>
          <th className="px-4 py-3">IP</th>
          <th className="px-4 py-3">Status</th>
          <th className="px-4 py-3">Response</th>
          <th className="px-4 py-3">HTTPS</th>
          <th className="px-4 py-3">Tech</th>
          <th className="px-4 py-3">State</th>
        </tr>
      </thead>
      <tbody>
        {results.map((result) => (
          <ResultRow key={result.id} result={result} />
        ))}
      </tbody>
    </Table>
  );
}
