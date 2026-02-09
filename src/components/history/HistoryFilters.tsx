import { Input } from "../ui/input";
import { Select } from "../ui/select";

export function HistoryFilters() {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <Input placeholder="Search history" className="md:max-w-sm" />
      <Select>
        <option>All statuses</option>
        <option>Completed</option>
        <option>Failed</option>
      </Select>
    </div>
  );
}
