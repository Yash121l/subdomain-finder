import { Upload } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";

export function WordlistUpload() {
  return (
    <Card>
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Upload wordlist</p>
      <div className="mt-4 flex flex-col gap-3">
        <input type="file" accept=".txt" className="text-sm text-slate-300" />
        <Button variant="secondary">
          <Upload size={16} className="mr-2" />
          Upload
        </Button>
      </div>
    </Card>
  );
}
