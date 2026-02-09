export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
        <span>Authorized security testing only. Always obtain permission before scanning.</span>
        <div className="flex items-center gap-3">
          <span>v0.1.0</span>
          <a className="hover:text-slate-300" href="https://github.com" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a className="hover:text-slate-300" href="https://docs.example.com" target="_blank" rel="noreferrer">
            Docs
          </a>
        </div>
      </div>
    </footer>
  );
}
