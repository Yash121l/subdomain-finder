import { Table } from "../ui/table";
import { useScanStore } from "../../store/scanStore";
import { ResultRow } from "./ResultRow";
import { useState, useMemo } from "react";
import { ResultsFiltersContainer } from "./ResultsFilters";
import { Globe, SearchX } from "lucide-react";

export function ResultsTable() {
  const results = useScanStore((state) => state.results);
  const status = useScanStore((state) => state.status);
  const outcome = useScanStore((state) => state.outcome);
  const lastError = useScanStore((state) => state.lastError);
  const [searchTerm, setSearchTerm] = useState("");
  const [resolvedFilter, setResolvedFilter] = useState<"all" | "resolved" | "unresolved">("all");

  const handleFilterChange = (search: string, resolved: "all" | "resolved" | "unresolved") => {
    setSearchTerm(search);
    setResolvedFilter(resolved);
  };

  const filteredResults = useMemo(() => {
    return results.filter((result) => {
      // Search filter
      if (searchTerm && !result.subdomain.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      // Resolved filter
      if (resolvedFilter === "resolved" && !result.resolved) {
        return false;
      }
      if (resolvedFilter === "unresolved" && result.resolved) {
        return false;
      }
      return true;
    });
  }, [results, searchTerm, resolvedFilter]);

  if (results.length === 0) {
    const failed = status === "failed";
    const completed = status === "completed";
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Globe className="h-16 w-16 text-[var(--color-text-muted)] mb-4" />
        <p className="text-[var(--color-text-secondary)] text-lg">
          {failed ? "Scan could not complete" : completed ? "No subdomains found" : "No subdomains discovered yet"}
        </p>
        <p className="text-[var(--color-text-muted)] text-sm mt-1">
          {failed
            ? lastError ?? "All selected sources failed or were rate limited."
            : outcome === "partial"
              ? "Some sources failed, and the remaining sources found no subdomains."
              : completed
                ? "The selected sources completed without returning subdomains."
                : "Start a scan to find subdomains"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ResultsFiltersContainer onFilterChange={handleFilterChange} />
      
      {filteredResults.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <SearchX className="h-12 w-12 text-[var(--color-text-muted)] mb-3" />
          <p className="text-[var(--color-text-secondary)]">No results match your filters</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
          <Table>
            <thead className="bg-[var(--color-bg-tertiary)] text-xs uppercase text-[var(--color-text-muted)]">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Subdomain</th>
                <th className="px-4 py-3 text-left font-medium">IP Address</th>
                <th className="px-4 py-3 text-left font-medium">Source</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((result) => (
                <ResultRow key={result.id} result={result} />
              ))}
            </tbody>
          </Table>
        </div>
      )}
      
      <p className="text-xs text-[var(--color-text-muted)] text-right">
        Showing {filteredResults.length} of {results.length} results
      </p>
    </div>
  );
}
