import { Card } from "../ui/card";
import { Badge } from "../ui/badge";

const activity = [
  { domain: "example.com", status: "running", time: "2 min ago" },
  { domain: "app.secure", status: "completed", time: "1 hour ago" },
  { domain: "internal.io", status: "failed", time: "3 hours ago" }
];

export function RecentActivity() {
  return (
    <Card>
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Recent activity</p>
      <div className="mt-4 space-y-3">
        {activity.map((item) => (
          <div key={item.domain} className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-200">{item.domain}</p>
              <p className="text-xs text-slate-500">{item.time}</p>
            </div>
            <Badge variant={item.status === "completed" ? "success" : item.status === "running" ? "warning" : "danger"}>
              {item.status}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}
