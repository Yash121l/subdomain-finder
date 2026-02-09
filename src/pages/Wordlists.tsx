import { WordlistManager } from "../components/wordlists/WordlistManager";

export function Wordlists() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">Wordlist manager</h2>
        <p className="text-sm text-slate-400">Upload, edit, and preview custom wordlists.</p>
      </div>
      <WordlistManager />
    </div>
  );
}
