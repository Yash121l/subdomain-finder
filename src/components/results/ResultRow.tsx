import { Badge } from "../ui/badge";
import type { ScanResult } from "../../types/scan.types";

export function ResultRow({ result }: { result: ScanResult }) {
  return (
    <tr className="border-t border-slate-800">
      <td className="px-4 py-3 text-sm text-primary-200">
        <a href={`https://${result.subdomain}`} target="_blank" rel="noreferrer">
          {result.subdomain}
        </a>
      </td>
      <td className="px-4 py-3 text-xs text-slate-300">{result.ipAddresses.join(", ")}</td>
      <td className="px-4 py-3 text-xs text-slate-300">{result.statusCode}</td>
      <td className="px-4 py-3 text-xs text-slate-300">{result.responseTime} ms</td>
      <td className="px-4 py-3 text-xs text-slate-300">{result.https ? "Yes" : "No"}</td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {result.technologies.map((tech) => (
            <Badge key={tech} variant="neutral">
              {tech}
            </Badge>
          ))}
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge variant={result.active ? "success" : "danger"}>{result.active ? "Active" : "Inactive"}</Badge>
      </td>
    </tr>
  );
}
