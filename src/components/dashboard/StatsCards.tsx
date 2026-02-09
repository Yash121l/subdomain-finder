import { Card } from "../ui/card";

const stats = [
  { label: "Total subdomains", value: "1,842" },
  { label: "Active", value: "1,321" },
  { label: "Unique IPs", value: "428" },
  { label: "Avg response", value: "182 ms" }
];

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{stat.label}</p>
          <p className="mt-3 text-2xl font-semibold text-white">{stat.value}</p>
        </Card>
      ))}
    </div>
  );
}
