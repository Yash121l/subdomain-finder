import { Download, Copy } from "lucide-react";
import { Button } from "../ui/button";

export function ExportButtons() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline">
        <Download size={16} className="mr-2" />
        Export JSON
      </Button>
      <Button variant="outline">
        <Download size={16} className="mr-2" />
        Export CSV
      </Button>
      <Button variant="outline">
        <Download size={16} className="mr-2" />
        Export TXT
      </Button>
      <Button variant="ghost">
        <Copy size={16} className="mr-2" />
        Copy
      </Button>
    </div>
  );
}
