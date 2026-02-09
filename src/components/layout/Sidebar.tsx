import { Card } from "../ui/card";
import { useScanStore } from "../../store/scanStore";
import { Activity, Database, CheckCircle, Globe, Zap, BarChart } from "lucide-react";

const osintSources = [
  { name: "crt.sh", desc: "Certificate Transparency" },
  { name: "HackerTarget", desc: "DNS Search" },
];

const tips = [
  "Certificate Transparency logs are a goldmine for finding subdomains. They contain all SSL certificates ever issued for a domain.",
  "DNS brute-forcing can find subdomains not in CT logs, but may trigger rate limits.",
  "Wildcard certificates (*.domain.com) indicate the domain uses subdomain-based services.",
  "Check for development subdomains like dev., staging., test. for potential misconfigurations.",
];

export function Sidebar() {
  const status = useScanStore((state) => state.status);
  const results = useScanStore((state) => state.results);
  const progress = useScanStore((state) => state.progress);
  
  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  const statusColors = {
    idle: "text-[var(--color-text-muted)]",
    running: "text-blue-500",
    paused: "text-amber-500",
    completed: "text-green-500",
    failed: "text-red-500",
  };

  return (
    <aside className="space-y-4">
      {/* Status */}
      <Card hover={false} className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--color-text-muted)] font-medium">
            <Activity className="h-4 w-4" />
            Status
          </h3>
          <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColors[status]} bg-[var(--color-bg-tertiary)]`}>
            {status}
          </span>
        </div>
        <p className="text-xs text-[var(--color-text-secondary)]">Current scan</p>
      </Card>

      {/* Statistics */}
      <Card hover={false} className="p-4">
        <h3 className="flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--color-text-muted)] font-medium mb-3">
          <BarChart className="h-4 w-4" />
          Statistics
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--color-text-secondary)]">Discovered</span>
            <span className="text-sm font-semibold text-[var(--color-text)]">{results.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--color-text-secondary)]">Resolved</span>
            <span className="text-sm font-semibold text-green-500">{progress.resolved}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--color-text-secondary)]">Progress</span>
            <span className="text-sm font-semibold text-[var(--color-text)]">{progress.percent}%</span>
          </div>
        </div>
      </Card>

      {/* OSINT Sources */}
      <Card hover={false} className="p-4">
        <h3 className="flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--color-text-muted)] font-medium mb-3">
          <Globe className="h-4 w-4" />
          OSINT Sources
        </h3>
        <div className="space-y-2">
          {osintSources.map((source) => (
            <div key={source.name} className="flex justify-between items-center text-sm">
              <span className="text-[var(--color-text)]">{source.name}</span>
              <span className="text-xs text-[var(--color-text-muted)]">{source.desc}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Pro Tip */}
      <Card hover={false} className="p-4 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
        <h3 className="flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--color-text-muted)] font-medium mb-2">
          <Zap className="h-4 w-4 text-amber-500" />
          Pro Tip
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          {randomTip}
        </p>
      </Card>
    </aside>
  );
}
