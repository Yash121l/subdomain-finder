import { Card } from "../ui/card";
import { Button } from "../ui/button";

export function WordlistEditor() {
  return (
    <Card>
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Editor</p>
      <textarea
        className="mt-4 h-40 w-full rounded-md border border-slate-800 bg-slate-900 p-3 text-sm text-slate-200"
        placeholder="Add one subdomain per line"
      />
      <div className="mt-3 flex gap-2">
        <Button variant="primary">Save</Button>
        <Button variant="outline">Delete</Button>
      </div>
    </Card>
  );
}
