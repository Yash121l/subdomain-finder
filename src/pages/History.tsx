import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../lib/api";
import { Clock, Globe, Search, Trash2, ExternalLink, LogIn } from "lucide-react";

type ScanEntry = {
  id: string;
  domain: string;
  status: string;
  total_found: number;
  total_resolved: number;
  created_at: string;
};

export function History() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [scans, setScans] = useState<ScanEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadScans();
    } else if (!authLoading && !isAuthenticated) {
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this scan?")) return;
    await apiClient.deleteScan(id);
    setScans(scans.filter((s) => s.id !== id));
  };

  const filteredScans = scans.filter((scan) =>
    scan.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isAuthenticated && !authLoading) {
    return (
      <Card className="text-center py-12">
        <LogIn className="h-16 w-16 text-slate-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Sign in to view history</h2>
        <p className="text-slate-400 mb-6">Your scan history is saved when you're logged in</p>
        <Button onClick={() => navigate("/login")}>
          <LogIn className="h-4 w-4" />
          Sign In
        </Button>
      </Card>
    );
  }

  return (
    <Card className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
            <Clock className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Scan History</h2>
            <p className="text-xs text-slate-500">Review and manage your previous scans</p>
          </div>
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            placeholder="Search domains..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      ) : filteredScans.length === 0 ? (
        <div className="text-center py-12">
          <Globe className="h-12 w-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400">No scans found</p>
          <Button variant="ghost" className="mt-4" onClick={() => navigate("/scan")}>
            Start your first scan
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredScans.map((scan) => (
            <div
              key={scan.id}
              className="flex items-center justify-between rounded-lg bg-slate-900/50 p-4 hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <Globe className="h-5 w-5 text-indigo-400" />
                <div>
                  <p className="font-medium text-slate-200">{scan.domain}</p>
                  <p className="text-xs text-slate-500">{formatDate(scan.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gradient">{scan.total_found}</p>
                  <p className="text-xs text-slate-500">found</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-emerald-400">{scan.total_resolved}</p>
                  <p className="text-xs text-slate-500">resolved</p>
                </div>
                <Badge
                  variant={scan.status === "completed" ? "success" : scan.status === "running" ? "info" : "error"}
                >
                  {scan.status}
                </Badge>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/scan/${scan.domain}`)}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(scan.id)}
                  >
                    <Trash2 className="h-4 w-4 text-rose-400" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
