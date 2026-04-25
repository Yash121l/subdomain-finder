import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "../components/ui/card";
import { ArrowLeft, BookOpen, Search, Shield, Globe } from "lucide-react";

export function WhatIsSubdomainLookup() {
  useEffect(() => {
    document.title = "What is Subdomain Lookup? | Complete Guide";
    
    // Update meta tags dynamically for this page
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Learn what subdomain lookup is, why it's important for security and SEO, and how to find subdomains using OSINT tools in this comprehensive guide.");
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
        <div className="flex items-center gap-3 text-blue-500 mb-2">
          <BookOpen className="h-6 w-6" />
          <span className="font-semibold tracking-wider uppercase text-sm">Educational Guide</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--color-text)]">
          What is a Subdomain Lookup?
        </h1>
        <p className="text-lg md:text-xl text-[var(--color-text-muted)] leading-relaxed">
          A complete guide to understanding subdomains, why they matter for cybersecurity and SEO, and how to find them.
        </p>
      </div>

      {/* Author Bio Snippet */}
      <div className="flex items-center gap-4 py-6 border-y border-[var(--color-border)]">
        <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold text-xl">
          YL
        </div>
        <div>
          <div className="font-medium text-[var(--color-text)]">Yash Lunawat</div>
          <div className="text-sm text-[var(--color-text-muted)] flex gap-3">
            <a href="http://yashlunawat.com/" target="_blank" rel="noreferrer" className="hover:text-blue-400">Website</a>
            <a href="https://x.com/YashLunawat14" target="_blank" rel="noreferrer" className="hover:text-blue-400">Twitter</a>
            <a href="https://www.linkedin.com/in/yash-lunawat-/" target="_blank" rel="noreferrer" className="hover:text-blue-400">LinkedIn</a>
          </div>
        </div>
      </div>

      <div className="prose prose-invert max-w-none text-[var(--color-text-muted)] space-y-6">
        <h2 className="text-2xl font-semibold text-[var(--color-text)] flex items-center gap-2">
          <Globe className="h-6 w-6 text-blue-400" /> Understanding Domains and Subdomains
        </h2>
        <p>
          Before diving into subdomain lookups, we first need to understand the anatomy of a URL. A typical domain looks like <code>example.com</code>. The "example" is the second-level domain (SLD), and the ".com" is the top-level domain (TLD).
        </p>
        <p>
          A <strong>subdomain</strong> is an additional part added to the beginning of a domain name to organize and navigate to different sections of a website. For instance, in <code>blog.example.com</code>, the word "blog" is the subdomain. Subdomains are incredibly versatile and allow organizations to host entirely different applications, services, or environments without registering new domain names.
        </p>

        <h2 className="text-2xl font-semibold text-[var(--color-text)] mt-10 flex items-center gap-2">
          <Search className="h-6 w-6 text-green-400" /> What is a Subdomain Lookup?
        </h2>
        <p>
          A <strong>subdomain lookup</strong> (also known as subdomain enumeration) is the process of finding and listing all the valid subdomains for a given primary domain. Because organizations often create hundreds or thousands of subdomains over time, they frequently lose track of them. Subdomain lookup tools help map out this hidden infrastructure.
        </p>

        <h3 className="text-xl font-medium text-[var(--color-text)]">How Do Subdomain Lookups Work?</h3>
        <p>
          Finding subdomains isn't as simple as asking a server for a list. Domain Name System (DNS) servers are typically configured to prevent "zone transfers," which means you cannot simply download the entire DNS phonebook for a domain. Instead, tools must use a variety of techniques:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>OSINT (Open Source Intelligence):</strong> Querying public search engines, GitHub repositories, and specialized databases like HackerTarget.</li>
          <li><strong>Certificate Transparency Logs:</strong> Every time a company creates an SSL/TLS certificate for a subdomain (e.g., to enable HTTPS), it is logged publicly in databases like <em>crt.sh</em>. This is one of the most reliable ways to find subdomains.</li>
          <li><strong>Brute Forcing:</strong> Guessing common subdomain names (like <em>dev</em>, <em>staging</em>, <em>api</em>, <em>mail</em>) and seeing if they resolve to an IP address.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-[var(--color-text)] mt-10 flex items-center gap-2">
          <Shield className="h-6 w-6 text-purple-400" /> Why is Subdomain Lookup Important?
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6 my-8">
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-[var(--color-text)] mb-3">For Bug Bounty & Security</h4>
            <p className="text-sm">
              The main website (<code>www</code>) is usually heavily fortified. However, developers often spin up staging environments (<code>staging.example.com</code>) or legacy admin panels (<code>admin.old.example.com</code>) and forget about them. These forgotten assets often contain outdated software and critical vulnerabilities. Subdomain enumeration expands the attack surface, allowing security researchers to find and report these weak links before malicious hackers exploit them.
            </p>
          </Card>
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-[var(--color-text)] mb-3">For SEO and Competitor Analysis</h4>
            <p className="text-sm">
              SEO professionals use subdomain lookups to reverse-engineer a competitor's web strategy. Do they host their blog on a subdomain? Do they have regional sites? By analyzing a company's subdomains, you can gain insights into their content architecture and digital marketing strategy.
            </p>
          </Card>
        </div>

        <h2 className="text-2xl font-semibold text-[var(--color-text)] mt-10">Try a Subdomain Lookup Now</h2>
        <p>
          Ready to see what you can find? We've built a fast, free, and in-browser OSINT subdomain lookup tool that queries Certificate Transparency logs and passive DNS databases simultaneously.
        </p>
        
        <div className="mt-6">
          <Link 
            to="/scan" 
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-8 py-3 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-700 disabled:pointer-events-none disabled:opacity-50"
          >
            Launch Free Subdomain Scanner
          </Link>
        </div>
      </div>
    </div>
  );
}
