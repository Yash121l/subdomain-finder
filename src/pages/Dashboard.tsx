import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../lib/api";
import { 
  BarChart3, Globe, CheckCircle, Clock, 
  TrendingUp, Calendar, ArrowRight 
} from "lucide-react";

type DashboardStats = {
  totalScans: number;
  totalSubdomains: number;
  totalResolved: number;
  recentScans: Array<{
    id: string;
    domain: string;
    total_found: number;
    created_at: string;
  }>;
};

export function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalScans: 0,
    totalSubdomains: 0,
    totalResolved: 0,
    recentScans: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadDashboardData();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    const result = await apiClient.getScans();
    if (result.data?.scans) {
      const scans = result.data.scans;
      setStats({
        totalScans: scans.length,
        totalSubdomains: scans.reduce((acc: number, s: { total_found?: number }) => acc + (s.total_found || 0), 0),
        totalResolved: scans.reduce((acc: number, s: { total_resolved?: number }) => acc + (s.total_resolved || 0), 0),
        recentScans: scans.slice(0, 5),
      });
    }
    setIsLoading(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (!isAuthenticated && !authLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text)]">Dashboard</h1>
        </div>
        <Card className="text-center py-8 sm:py-12 px-4">
          <BarChart3 className="h-12 w-12 sm:h-16 sm:w-16 text-[var(--color-text-muted)] mx-auto mb-4" />
          <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-text)] mb-2">
            Sign in to view your dashboard
          </h2>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] mb-6">
            Track your scan history and statistics
          </p>
          <Button onClick={() => navigate("/login")}>Sign In</Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
      </div>
    );
  }

  const statCards = [
    { 
      icon: BarChart3, 
      label: "Total Scans", 
      value: stats.totalScans,
      color: "text-blue-500" 
    },
    { 
      icon: Globe, 
      label: "Subdomains Found", 
      value: stats.totalSubdomains,
      color: "text-purple-500" 
    },
    { 
      icon: CheckCircle, 
      label: "DNS Resolved", 
      value: stats.totalResolved,
      color: "text-green-500" 
    },
    { 
      icon: TrendingUp, 
      label: "Resolution Rate", 
      value: stats.totalSubdomains > 0 
        ? `${Math.round((stats.totalResolved / stats.totalSubdomains) * 100)}%` 
        : "0%",
      color: "text-orange-500" 
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text)]">Dashboard</h1>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)]">Overview of your scanning activity</p>
        </div>
        <Button onClick={() => navigate("/scan")} className="w-full sm:w-auto">
          New Scan
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} hover={false} className="space-y-1 sm:space-y-2 p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
              <span className="text-xs sm:text-sm text-[var(--color-text-secondary)] truncate">{stat.label}</span>
            </div>
            <p className="text-xl sm:text-3xl font-bold text-[var(--color-text)]">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Recent Scans */}
      <Card hover={false} className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--color-text-secondary)]" />
            <h2 className="text-sm sm:text-base font-semibold text-[var(--color-text)]">Recent Scans</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/history")}>
            <span className="hidden sm:inline">View All</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {stats.recentScans.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <Globe className="h-10 w-10 sm:h-12 sm:w-12 text-[var(--color-text-muted)] mx-auto mb-3" />
            <p className="text-sm sm:text-base text-[var(--color-text-secondary)]">No scans yet</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate("/scan")}>
              Start your first scan
            </Button>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {stats.recentScans.map((scan) => (
              <div
                key={scan.id}
                className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-border)] transition-colors cursor-pointer"
                onClick={() => navigate(`/scan/${scan.domain}`)}
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--color-text-secondary)] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm sm:text-base font-medium text-[var(--color-text)] truncate">{scan.domain}</p>
                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                      <Calendar className="h-3 w-3" />
                      {formatDate(scan.created_at)}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className="text-sm sm:text-base font-semibold text-[var(--color-text)]">{scan.total_found}</p>
                  <p className="text-xs text-[var(--color-text-muted)] hidden sm:block">subdomains</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
