import { Badge } from "../ui/badge";
import type { ScanResult } from "../../types/scan.types";
import { Copy, ExternalLink, Globe, Server } from "lucide-react";
import { useState } from "react";

export function ResultRow({ result }: { result: ScanResult }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result.subdomain);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const getSourceBadgeVariant = (source: string) => {
    switch (source) {
      case "crtsh":
        return "info";
      case "hackertarget":
        return "warning";
      default:
        return "default";
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "crtsh":
        return "CT";
      case "hackertarget":
        return "DNS";
      default:
        return source;
    }
  };

  return (
    <tr className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)] transition-colors">
      {/* Subdomain */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-blue-500 flex-shrink-0" />
          <a
            href={`https://${result.subdomain}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-[var(--color-text)] hover:text-blue-500 transition-colors truncate max-w-[200px]"
            title={result.subdomain}
          >
            {result.subdomain}
          </a>
          <button
            onClick={copyToClipboard}
            className="p-1 rounded hover:bg-[var(--color-border)] transition-colors"
            title="Copy subdomain"
          >
            <Copy className={`h-3 w-3 ${copied ? "text-green-500" : "text-[var(--color-text-muted)]"}`} />
          </button>
          <a
            href={`https://${result.subdomain}`}
            target="_blank"
            rel="noreferrer"
            className="p-1 rounded hover:bg-[var(--color-border)] transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="h-3 w-3 text-[var(--color-text-muted)]" />
          </a>
        </div>
      </td>

      {/* IP Addresses */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-[var(--color-text-muted)] flex-shrink-0" />
          <span className="text-xs text-[var(--color-text-secondary)] truncate max-w-[120px]">
            {result.ipAddresses.length > 0
              ? result.ipAddresses.slice(0, 2).join(", ")
              : "—"}
            {result.ipAddresses.length > 2 && ` +${result.ipAddresses.length - 2}`}
          </span>
        </div>
      </td>

      {/* Source */}
      <td className="px-4 py-3">
        <Badge variant={getSourceBadgeVariant(result.source)} size="sm">
          {getSourceLabel(result.source)}
        </Badge>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <Badge
          variant={result.resolved ? "success" : "default"}
          size="sm"
        >
          {result.resolved ? "Resolved" : "Pending"}
        </Badge>
      </td>
    </tr>
  );
}
