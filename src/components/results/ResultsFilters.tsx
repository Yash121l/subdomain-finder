import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { STATUS_OPTIONS } from "../../lib/constants";

export function ResultsFilters() {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <Input placeholder="Search subdomains" className="md:max-w-sm" />
      <div className="flex flex-wrap gap-2">
        <Select>
          <option>All statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </Select>
        <Select>
          <option>All activity</option>
          <option>Active</option>
          <option>Inactive</option>
        </Select>
      </div>
    </div>
  );
}
