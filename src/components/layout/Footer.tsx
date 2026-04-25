import { Shield, ExternalLink, BookOpen, Globe } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg)] py-8 mt-auto">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <h4 className="font-medium text-[var(--color-text)] flex items-center gap-2">
              <Shield className="h-4 w-4" /> Subdomain Finder
            </h4>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              For authorized security testing only. Always obtain permission before scanning.
              Free OSINT subdomain discovery tool built for bug bounty hunters and researchers.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-[var(--color-text)] flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Educational Resources
            </h4>
            <div className="flex flex-col gap-2 text-sm text-[var(--color-text-muted)]">
              <Link to="/what-is-subdomain-lookup" className="hover:text-[var(--color-text)] transition-colors">
                What is a Subdomain Lookup?
              </Link>
              <Link to="/subdomain-enumeration-guide" className="hover:text-[var(--color-text)] transition-colors">
                Subdomain Enumeration Guide
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-[var(--color-text)] flex items-center gap-2">
              <Globe className="h-4 w-4" /> Connect
            </h4>
            <div className="flex flex-col gap-2 text-sm text-[var(--color-text-muted)]">
              <a href="http://yashlunawat.com/" target="_blank" rel="noreferrer" className="hover:text-[var(--color-text)] transition-colors flex items-center gap-1">
                Portfolio <ExternalLink className="h-3 w-3" />
              </a>
              <a href="https://github.com/Yash121l" target="_blank" rel="noreferrer" className="hover:text-[var(--color-text)] transition-colors flex items-center gap-1">
                GitHub <ExternalLink className="h-3 w-3" />
              </a>
              <a href="https://www.linkedin.com/in/yash-lunawat-/" target="_blank" rel="noreferrer" className="hover:text-[var(--color-text)] transition-colors flex items-center gap-1">
                LinkedIn <ExternalLink className="h-3 w-3" />
              </a>
              <a href="https://x.com/YashLunawat14" target="_blank" rel="noreferrer" className="hover:text-[var(--color-text)] transition-colors flex items-center gap-1">
                Twitter/X <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="pt-6 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-text-muted)]">
          <p>© {new Date().getFullYear()} Yash Lunawat. Open Source.</p>
          <span className="px-2 py-1 rounded-md bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
            v1.0.0
          </span>
        </div>
      </div>
    </footer>
  );
}
