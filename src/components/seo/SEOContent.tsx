import { Link } from "react-router-dom";
import { Card } from "../ui/card";
import { Shield, Zap, Search, Globe, ChevronDown, CheckCircle2 } from "lucide-react";

export function SEOContent() {
  return (
    <div className="mt-12 space-y-12">
      {/* Header & Trust Signals */}
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-text)]">
            Free Subdomain Lookup Tool
          </h1>
          <h2 className="text-lg sm:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto">
            Find All Subdomains of Any Domain Instantly. The ultimate OSINT and reconnaissance tool.
          </h2>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>Free & Open Source</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span>Fast Results</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <Shield className="h-4 w-4 text-blue-500" />
            <span>No Signup Required</span>
          </div>
        </div>
      </div>

      {/* Main Content Blocks */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Search className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--color-text)]">What is a Subdomain Lookup?</h3>
          </div>
          <p className="text-[var(--color-text-muted)] leading-relaxed">
            A subdomain lookup is a critical reconnaissance technique used to discover subdomains associated with a primary domain. When developers create new applications, staging environments, or internal portals, they often host them on subdomains (e.g., <code>api.example.com</code> or <code>staging.example.com</code>). 
          </p>
          <p className="text-[var(--color-text-muted)] leading-relaxed">
            Our free subdomain lookup tool automates this discovery process by querying public datasets, certificate transparency logs (like crt.sh), and passive DNS records. By aggregating these OSINT (Open Source Intelligence) sources, you can quickly find subdomains online without triggering rate limits or security alerts on the target servers. This makes it an essential first step for any external attack surface management (EASM) strategy.
          </p>
        </Card>

        <Card className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Shield className="h-5 w-5 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--color-text)]">Why Use a Subdomain Finder?</h3>
          </div>
          <p className="text-[var(--color-text-muted)] leading-relaxed">
            Subdomain enumeration is a foundational step for anyone working in web security. Security researchers, bug bounty hunters, and penetration testers use subdomain scanners to map out a target's digital footprint. Often, the most critical vulnerabilities are found not on the main corporate website, but on forgotten, outdated, or undocumented subdomains that lack proper security controls.
          </p>
          <ul className="space-y-2 text-[var(--color-text-muted)] list-disc pl-5">
            <li><strong>Bug Bounty Reconnaissance:</strong> Discover hidden assets to expand your attack surface and find lucrative vulnerabilities.</li>
            <li><strong>Security Auditing:</strong> Identify rogue or abandoned subdomains that could be susceptible to subdomain takeover attacks.</li>
            <li><strong>SEO Analysis:</strong> Understand how a competitor structures their web properties and content silos across different subdomains.</li>
          </ul>
        </Card>
      </div>

      {/* How it works */}
      <Card className="p-6 sm:p-8">
        <h3 className="text-xl font-semibold text-[var(--color-text)] mb-4">How This Subdomain Enumeration Tool Works</h3>
        <div className="space-y-4 text-[var(--color-text-muted)]">
          <p>
            Unlike aggressive active scanning tools like Amass or Subfinder, our online subdomain finder operates passively in your browser. This means you get blazingly fast results without installing anything on your local machine.
          </p>
          <p>
            When you enter a domain, the tool performs concurrent API requests to multiple open-source intelligence databases. It pulls certificate transparency logs from <strong>crt.sh</strong> and passive DNS data from <strong>HackerTarget</strong>. The results are then deduplicated and cleaned up in real-time. Finally, it uses DNS-over-HTTPS (DoH) via Cloudflare and Google to actively resolve the discovered subdomains to their IP addresses, verifying that they are alive and accessible.
          </p>
          <p>
            Once the scan is complete, you can easily export the results in JSON, CSV, or TXT formats, making it simple to plug the data into your existing bug bounty pipelines or automated security workflows.
          </p>
        </div>
      </Card>

      {/* Popular Scans (Programmatic SEO) */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-[var(--color-text)] flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-400" /> Popular Domain Scans
        </h3>
        <p className="text-sm text-[var(--color-text-muted)]">Check out recent subdomain lookup results for popular technology companies:</p>
        <div className="flex flex-wrap gap-3">
          {["google.com", "facebook.com", "amazon.com", "apple.com", "microsoft.com", "github.com", "netflix.com"].map((domain) => (
            <Link
              key={domain}
              to={`/scan/${domain}`}
              className="px-4 py-2 rounded-md bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-blue-500/50 hover:text-blue-400 transition-colors text-sm font-medium"
            >
              {domain}
            </Link>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-6">
        <h3 className="text-2xl font-semibold text-[var(--color-text)]">Frequently Asked Questions</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-5">
            <h4 className="font-medium text-[var(--color-text)] mb-2">Is this subdomain lookup tool really free?</h4>
            <p className="text-sm text-[var(--color-text-muted)]">
              Yes, it is completely free to use with no hidden costs, no signup required, and no artificial API limits. It is designed to be an accessible tool for the cybersecurity community.
            </p>
          </Card>
          <Card className="p-5">
            <h4 className="font-medium text-[var(--color-text)] mb-2">Can I use it for bug bounty?</h4>
            <p className="text-sm text-[var(--color-text-muted)]">
              Absolutely. It's built specifically for bug bounty recon and external attack surface management. You can quickly discover target subdomains and export them to your favorite tools.
            </p>
          </Card>
          <Card className="p-5">
            <h4 className="font-medium text-[var(--color-text)] mb-2">How accurate is the subdomain enumeration?</h4>
            <p className="text-sm text-[var(--color-text-muted)]">
              We aggregate data from highly reliable Certificate Transparency logs and passive DNS databases. While no single passive tool can find 100% of all subdomains, this tool provides an excellent baseline that you can further enrich with active brute-forcing tools.
            </p>
          </Card>
          <Card className="p-5">
            <h4 className="font-medium text-[var(--color-text)] mb-2">Are my scans private?</h4>
            <p className="text-sm text-[var(--color-text-muted)]">
              Yes. All aggregation and DNS resolution logic happens directly within your browser. We do not store your search queries or the discovered subdomains on any central server.
            </p>
          </Card>
        </div>
      </div>

    </div>
  );
}
