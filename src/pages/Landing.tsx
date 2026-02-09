import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { 
  Search, Shield, Zap, Globe, ArrowRight, 
  Database, Lock, Sparkles 
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "OSINT Discovery",
    description: "Leverage crt.sh and HackerTarget APIs for comprehensive subdomain enumeration",
  },
  {
    icon: Zap,
    title: "Real-time DNS",
    description: "DNS-over-HTTPS resolution via Cloudflare and Google for instant verification",
  },
  {
    icon: Database,
    title: "Export Results",
    description: "Download findings in JSON, CSV, or TXT formats for further analysis",
  },
  {
    icon: Lock,
    title: "Secure & Private",
    description: "All scanning happens in your browser - no data sent to third-party servers",
  },
];

const stats = [
  { value: "10M+", label: "Subdomains Discovered" },
  { value: "100K+", label: "Scans Completed" },
  { value: "99.9%", label: "Uptime" },
  { value: "Free", label: "Forever" },
];

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="space-y-16 sm:space-y-24 py-4 sm:py-8 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center space-y-6 sm:space-y-8">
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-xs sm:text-sm text-[var(--color-text-secondary)]">
          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>Free & Open Source</span>
        </div>
        
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight">
          <span className="text-[var(--color-text)]">Discover Subdomains</span>
          <br />
          <span className="text-[var(--color-text-secondary)]">In Seconds</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-sm sm:text-lg text-[var(--color-text-secondary)] leading-relaxed px-4">
          Powerful subdomain enumeration using OSINT sources. Find hidden assets, 
          verify DNS records, and export results — all from your browser.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
          <Button size="lg" className="w-full sm:w-auto" onClick={() => navigate("/scan")}>
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            Start Scanning
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => navigate("/login")}>
            Sign In
          </Button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center py-4">
            <p className="text-2xl sm:text-3xl font-bold text-[var(--color-text)]">{stat.value}</p>
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Features Section */}
      <section className="space-y-6 sm:space-y-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)]">
            Everything You Need
          </h2>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] mt-2">
            Professional-grade subdomain discovery without the complexity
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 sm:p-6">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--color-bg-tertiary)]">
                <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-[var(--color-text-secondary)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--color-text)]">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-6 sm:space-y-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)]">
            How It Works
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
          {[
            { step: "1", title: "Enter Domain", desc: "Type the target domain you want to scan" },
            { step: "2", title: "Run Scan", desc: "We query OSINT sources for subdomains" },
            { step: "3", title: "Export Results", desc: "Download or copy your findings" },
          ].map((item) => (
            <div key={item.step} className="text-center space-y-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent)] text-[var(--color-bg)] font-bold">
                {item.step}
              </div>
              <h3 className="font-semibold text-[var(--color-text)]">{item.title}</h3>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-4 sm:space-y-6 pb-8">
        <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-[var(--color-text-secondary)]">
          <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>For authorized security testing only</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)]">
          Ready to Start?
        </h2>
        <Button size="lg" onClick={() => navigate("/scan")}>
          <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
          Launch Scanner
        </Button>
      </section>
    </div>
  );
}
