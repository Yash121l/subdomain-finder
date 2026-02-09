import { Download, Copy, Check, FileJson, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "../ui/button";
import { useScanStore } from "../../store/scanStore";
import { useState } from "react";

export function ExportButtons() {
  const results = useScanStore((state) => state.results);
  const [copied, setCopied] = useState(false);
  
  const hasResults = results.length > 0;

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const data = results.map((r) => ({
      subdomain: r.subdomain,
      ipAddresses: r.ipAddresses,
      source: r.source,
      resolved: r.resolved,
      discoveredAt: new Date(r.discoveredAt).toISOString(),
    }));
    downloadFile(JSON.stringify(data, null, 2), "subdomains.json", "application/json");
  };

  const exportCSV = () => {
    const headers = ["Subdomain", "IP Addresses", "Source", "Resolved", "Discovered At"];
    const rows = results.map((r) => [
      r.subdomain,
      r.ipAddresses.join(";"),
      r.source,
      r.resolved ? "Yes" : "No",
      new Date(r.discoveredAt).toISOString(),
    ]);
    
    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");
    
    downloadFile(csv, "subdomains.csv", "text/csv");
  };

  const exportTXT = () => {
    const txt = results.map((r) => r.subdomain).join("\n");
    downloadFile(txt, "subdomains.txt", "text/plain");
  };

  const copyToClipboard = () => {
    const txt = results.map((r) => r.subdomain).join("\n");
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={exportJSON} disabled={!hasResults}>
        <FileJson className="h-4 w-4" />
        JSON
      </Button>
      <Button variant="outline" size="sm" onClick={exportCSV} disabled={!hasResults}>
        <FileSpreadsheet className="h-4 w-4" />
        CSV
      </Button>
      <Button variant="outline" size="sm" onClick={exportTXT} disabled={!hasResults}>
        <FileText className="h-4 w-4" />
        TXT
      </Button>
      <Button variant="ghost" size="sm" onClick={copyToClipboard} disabled={!hasResults}>
        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied!" : "Copy All"}
      </Button>
    </div>
  );
}
