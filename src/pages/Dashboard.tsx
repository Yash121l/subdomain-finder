import { StatsCards } from "../components/dashboard/StatsCards";
import { ChartsSection } from "../components/dashboard/ChartsSection";
import { RecentActivity } from "../components/dashboard/RecentActivity";

export function Dashboard() {
  return (
    <div className="space-y-6">
      <StatsCards />
      <ChartsSection />
      <RecentActivity />
    </div>
  );
}
