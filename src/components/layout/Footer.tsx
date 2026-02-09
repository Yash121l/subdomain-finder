import { Shield, Heart, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800/50 bg-slate-950/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Shield className="h-4 w-4 text-amber-500/60" />
          <span>For authorized security testing only. Always obtain permission before scanning.</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-600">
          <span className="flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-rose-500/60" /> for security researchers
          </span>
          <span className="text-slate-700">•</span>
          <span className="rounded-full bg-slate-800/50 px-2 py-0.5 text-[10px] font-medium text-slate-500">
            v1.0.0
          </span>
          <a 
            className="flex items-center gap-1 hover:text-slate-400 transition-colors" 
            href="https://github.com" 
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
