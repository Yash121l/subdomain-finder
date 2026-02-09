import * as React from "react";
import { cn } from "../../lib/utils";

type TableProps = React.TableHTMLAttributes<HTMLTableElement>;

export function Table({ className, ...props }: TableProps) {
  return (
    <div className="w-full overflow-auto rounded-lg border border-slate-800">
      <table className={cn("w-full text-left text-sm", className)} {...props} />
    </div>
  );
}
