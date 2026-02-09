import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { WordlistUpload } from "./WordlistUpload";
import { WordlistEditor } from "./WordlistEditor";

const lists = [
  { name: "Common (1k)", entries: 1000 },
  { name: "Extended (10k)", entries: 10000 },
  { name: "Comprehensive (100k+)", entries: 120000 }
];

export function WordlistManager() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Available wordlists</p>
          <Button variant="outline" className="text-xs">
            Create new
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {lists.map((list) => (
            <div key={list.name} className="flex items-center justify-between rounded-md border border-slate-800 px-4 py-3">
              <div>
                <p className="text-sm text-slate-200">{list.name}</p>
                <p className="text-xs text-slate-500">{list.entries.toLocaleString()} entries</p>
              </div>
              <Button variant="ghost">Preview</Button>
            </div>
          ))}
        </div>
      </Card>
      <div className="space-y-4">
        <WordlistUpload />
        <WordlistEditor />
      </div>
    </div>
  );
}
