import { Shield, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg)] py-6 mt-auto">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <Shield className="h-4 w-4" />
          <span>For authorized security testing only. Always obtain permission before scanning.</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
          <span className="px-2 py-1 rounded-md bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
            v1.0.0
          </span>
          <a 
            className="flex items-center gap-1 hover:text-[var(--color-text)] transition-colors" 
            href="https://github.com/Yash121l/subdomain-finder" 
            target="_blank" 
            rel="noreferrer"
          >
            GitHub <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
