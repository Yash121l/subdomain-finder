import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Search } from "lucide-react";
import { useState } from "react";

type Props = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  resolvedFilter: "all" | "resolved" | "unresolved";
  onResolvedFilterChange: (value: "all" | "resolved" | "unresolved") => void;
};

export function ResultsFilters({
  searchTerm,
  onSearchChange,
  resolvedFilter,
  onResolvedFilterChange,
}: Props) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="relative md:max-w-sm flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <Input
          placeholder="Search subdomains..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select
        value={resolvedFilter}
        onChange={(e) => onResolvedFilterChange(e.target.value as "all" | "resolved" | "unresolved")}
      >
        <option value="all">All subdomains</option>
        <option value="resolved">Resolved only</option>
        <option value="unresolved">Unresolved only</option>
      </Select>
    </div>
  );
}

// Wrapper that manages its own state for simpler usage
export function ResultsFiltersContainer({
  onFilterChange,
}: {
  onFilterChange: (search: string, resolved: "all" | "resolved" | "unresolved") => void;
}) {
  const [search, setSearch] = useState("");
  const [resolved, setResolved] = useState<"all" | "resolved" | "unresolved">("all");

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFilterChange(value, resolved);
  };

  const handleResolvedChange = (value: "all" | "resolved" | "unresolved") => {
    setResolved(value);
    onFilterChange(search, value);
  };

  return (
    <ResultsFilters
      searchTerm={search}
      onSearchChange={handleSearchChange}
      resolvedFilter={resolved}
      onResolvedFilterChange={handleResolvedChange}
    />
  );
}
