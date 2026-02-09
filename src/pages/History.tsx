import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../lib/api";
import { 
  Search, Globe, Clock, Trash2, 
  ExternalLink, History as HistoryIcon, Calendar, ChevronRight 
} from "lucide-react";

type Scan = {
  id: string;
  domain: string;
  total_found: number;
  total_resolved: number;
  created_at: string;
  status: string;
};

export function History() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadScans();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  const loadScans = async () => {
    setIsLoading(true);
    const result = await apiClient.getScans();
    if (result.data?.scans) {
      setScans(result.data.scans);
    }
    setIsLoading(false);
  };

  const deleteScan = async (id: string) => {
    const result = await apiClient.deleteScan(id);
    if (!result.error) {
      setScans(scans.filter((s) => s.id !== id));
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredScans = scans.filter((scan) =>
    scan.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated && !authLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text)]">History</h1>
        </div>
        <Card className="text-center py-8 sm:py-12 px-4">
          <HistoryIcon className="h-12 w-12 sm:h-16 sm:w-16 text-[var(--color-text-muted)] mx-auto mb-4" />
          <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-text)] mb-2">
            Sign in to view your history
          </h2>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] mb-6">
            Track your past scans and results
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text)]">Scan History</h1>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <Input
            placeholder="Search domains..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      {filteredScans.length === 0 ? (
        <Card className="text-center py-8 sm:py-12 px-4">
          {searchTerm ? (
            <>
              <Search className="h-10 w-10 sm:h-12 sm:w-12 text-[var(--color-text-muted)] mx-auto mb-3" />
              <p className="text-sm sm:text-base text-[var(--color-text-secondary)]">No scans matching "{searchTerm}"</p>
            </>
          ) : (
            <>
              <Globe className="h-10 w-10 sm:h-12 sm:w-12 text-[var(--color-text-muted)] mx-auto mb-3" />
              <p className="text-sm sm:text-base text-[var(--color-text-secondary)]">No scans yet</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate("/scan")}>
                Start your first scan
              </Button>
            </>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredScans.map((scan) => (
            <Card 
              key={scan.id} 
              className="p-4 sm:p-5 cursor-pointer hover:border-[var(--color-text-muted)] transition-colors"
              onClick={() => navigate(`/scan/${scan.domain}`)}
            >
              <div className="flex items-center justify-between gap-4">
                {/* Left side */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--color-bg-tertiary)]">
                    <Globe className="h-5 w-5 text-[var(--color-text-secondary)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm sm:text-base font-medium text-[var(--color-text)] truncate">
                        {scan.domain}
                      </p>
                      <Badge 
                        variant={scan.status === "completed" ? "success" : "warning"} 
                        size="sm"
                      >
                        {scan.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-[var(--color-text-muted)] mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(scan.created_at)}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline">{scan.total_found} found</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline">{scan.total_resolved} resolved</span>
                    </div>
                  </div>
                </div>

                {/* Right side - stats on mobile */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <div className="text-right sm:hidden">
                    <p className="text-sm font-semibold text-[var(--color-text)]">{scan.total_found}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">found</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="hidden sm:flex"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteScan(scan.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                  <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)]" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Count */}
      {filteredScans.length > 0 && (
        <p className="text-xs sm:text-sm text-[var(--color-text-muted)] text-center">
          Showing {filteredScans.length} of {scans.length} scans
        </p>
      )}
    </div>
  );
}
