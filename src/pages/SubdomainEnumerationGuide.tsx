import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "../components/ui/card";
import { ArrowLeft, BookOpen, Terminal, Database, Target, Zap } from "lucide-react";

export function SubdomainEnumerationGuide() {
  useEffect(() => {
    document.title = "Subdomain Enumeration Guide for Bug Bounty | Best Tools & Techniques";
    
    // Update meta tags dynamically for this page
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Master subdomain enumeration for bug bounty and security research. Learn passive and active techniques, top tools, and how to find hidden attack surfaces.");
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Scanner
      </Link>

      <div className="space-y-4">
        <div className="flex items-center gap-3 text-purple-500 mb-2">
          <BookOpen className="h-6 w-6" />
          <span className="font-semibold tracking-wider uppercase text-sm">Security Research Guide</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--color-text)]">
          The Ultimate Subdomain Enumeration Guide
        </h1>
        <p className="text-lg md:text-xl text-[var(--color-text-muted)] leading-relaxed">
          How to systematically discover hidden infrastructure, expand your attack surface, and find high-severity bugs before anyone else.
        </p>
      </div>

      {/* Author Bio Snippet */}
      <div className="flex items-center gap-4 py-6 border-y border-[var(--color-border)]">
        <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500 font-bold text-xl">
          YL
        </div>
        <div>
          <div className="font-medium text-[var(--color-text)]">Yash Lunawat</div>
          <div className="text-sm text-[var(--color-text-muted)] flex gap-3">
            <a href="http://yashlunawat.com/" target="_blank" rel="noreferrer" className="hover:text-purple-400">Website</a>
            <a href="https://x.com/YashLunawat14" target="_blank" rel="noreferrer" className="hover:text-purple-400">Twitter</a>
            <a href="https://github.com/Yash121l" target="_blank" rel="noreferrer" className="hover:text-purple-400">GitHub</a>
          </div>
        </div>
      </div>

      <div className="prose prose-invert max-w-none text-[var(--color-text-muted)] space-y-6">
        <p>
          In modern web application security testing and bug bounty hunting, reconnaissance is arguably the most critical phase. If you're only testing the primary <code>www.target.com</code> domain, you are competing against thousands of other hackers who are looking at the exact same endpoints.
        </p>
        <p>
          <strong>Subdomain enumeration</strong> is the art and science of mapping out a target's entire digital footprint. By finding obscure subdomains—like forgotten staging servers, internal admin panels, or unlinked APIs—you significantly increase your chances of finding critical vulnerabilities (P1s and P2s).
        </p>

        <h2 className="text-2xl font-semibold text-[var(--color-text)] mt-10 flex items-center gap-2">
          <Target className="h-6 w-6 text-red-400" /> Passive vs. Active Enumeration
        </h2>
        
        <p>There are two primary methodologies for discovering subdomains:</p>

        <div className="grid md:grid-cols-2 gap-6 my-6">
          <Card className="p-6 border-blue-500/20">
            <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
              <Database className="h-5 w-5" /> Passive Enumeration
            </h3>
            <p className="text-sm mb-4">
              Passive enumeration involves querying third-party services and public databases without ever sending a packet directly to the target's infrastructure. It is stealthy and fast.
            </p>
            <ul className="text-sm list-disc pl-4 space-y-1">
              <li>Certificate Transparency Logs (crt.sh)</li>
              <li>Search Engines (Google Dorks)</li>
              <li>Passive DNS datasets (HackerTarget, SecurityTrails)</li>
              <li>Internet Archives (Wayback Machine)</li>
            </ul>
          </Card>

          <Card className="p-6 border-red-500/20">
            <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
              <Terminal className="h-5 w-5" /> Active Enumeration
            </h3>
            <p className="text-sm mb-4">
              Active enumeration requires interacting directly with the target's DNS servers or web servers. While it generates noise and can be blocked by WAFs, it discovers undocumented assets.
            </p>
            <ul className="text-sm list-disc pl-4 space-y-1">
              <li>DNS Zone Transfers (AXFR)</li>
              <li>DNS Brute Forcing (using wordlists)</li>
              <li>VHOST Discovery</li>
              <li>Permutation/Alteration scanning</li>
            </ul>
          </Card>
        </div>

        <h2 className="text-2xl font-semibold text-[var(--color-text)] mt-10 flex items-center gap-2">
          <Zap className="h-6 w-6 text-yellow-400" /> Best Subdomain Finder Tools
        </h2>
        
        <p>
          A professional bug hunter doesn't rely on a single tool. They build automated pipelines that combine the output of multiple tools and resolve them continuously. Here are the industry standards:
        </p>

        <ul className="space-y-4 list-none pl-0">
          <li className="bg-[var(--color-bg-secondary)] p-4 rounded-lg border border-[var(--color-border)]">
            <strong className="text-[var(--color-text)] text-lg block mb-1">1. Subfinder (ProjectDiscovery)</strong>
            A lightning-fast passive subdomain discovery tool. It relies heavily on API keys from services like Shodan, Censys, and Chaos to pull vast amounts of passive data in seconds.
          </li>
          <li className="bg-[var(--color-bg-secondary)] p-4 rounded-lg border border-[var(--color-border)]">
            <strong className="text-[var(--color-text)] text-lg block mb-1">2. Amass (OWASP)</strong>
            The heavyweight champion of enumeration. Amass performs in-depth DNS enumeration, mapping out ASNs, and discovering subdomains through both active and passive scraping. It is incredibly thorough but can be slow and resource-intensive.
          </li>
          <li className="bg-[var(--color-bg-secondary)] p-4 rounded-lg border border-[var(--color-border)]">
            <strong className="text-[var(--color-text)] text-lg block mb-1">3. Puredns / Massdns</strong>
            Once you have generated millions of potential subdomains via brute-forcing or permutations, tools like Puredns use public DNS resolvers to verify which ones actually exist at breakneck speeds.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-[var(--color-text)] mt-10">Start Your Recon Workflow Today</h2>
        <p>
          Setting up complex CLI tools and managing API keys can be daunting for beginners. That's why we created a free, browser-based subdomain finder that aggregates top OSINT sources for you instantly.
        </p>
        <p>
          Whether you are testing a new bug bounty program or auditing your own company's external attack surface, our tool provides a massive head start—with no installation required.
        </p>
        
        <div className="mt-8 p-6 bg-purple-500/10 border border-purple-500/20 rounded-xl text-center">
          <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">Ready to Hunt?</h3>
          <p className="mb-6 text-sm">Enter a target domain to extract OSINT data from crt.sh and HackerTarget instantly.</p>
          <Link 
            to="/scan" 
            className="inline-flex items-center justify-center rounded-md bg-purple-600 px-8 py-3 text-sm font-medium text-white shadow transition-colors hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-700"
          >
            Go to Subdomain Scanner
          </Link>
        </div>
      </div>
    </div>
  );
}
