import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import { Card } from "../ui/card";

const timeline = [
  { name: "00:00", count: 12 },
  { name: "00:10", count: 42 },
  { name: "00:20", count: 88 },
  { name: "00:30", count: 120 },
  { name: "00:40", count: 162 }
];

const statusData = [
  { name: "200", value: 320 },
  { name: "301", value: 80 },
  { name: "403", value: 120 },
  { name: "404", value: 42 }
];

const techData = [
  { name: "Nginx", value: 120 },
  { name: "React", value: 90 },
  { name: "Apache", value: 70 },
  { name: "Cloudflare", value: 40 }
];

const colors = ["#3b82f6", "#22c55e", "#f97316", "#e11d48"];

export function ChartsSection() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Discovery timeline</p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeline}>
              <XAxis dataKey="name" stroke="#475569" />
              <YAxis stroke="#475569" />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Status distribution</p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={90}>
                {statusData.map((_, index) => (
                  <Cell key={index} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="lg:col-span-2">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Top technologies</p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={techData}>
              <XAxis dataKey="name" stroke="#475569" />
              <YAxis stroke="#475569" />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
