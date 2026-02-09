import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../lib/api";
import { User, Mail, Building, Calendar, Shield, LogOut, Save } from "lucide-react";

export function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [profile, setProfile] = useState<{
    id: string;
    email: string;
    name?: string;
    organization?: string;
    created_at?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
      return;
    }
    
    if (isAuthenticated) {
      loadProfile();
    }
  }, [authLoading, isAuthenticated, navigate]);

  const loadProfile = async () => {
    setIsLoading(true);
    const result = await apiClient.getMe();
    if (result.data?.user) {
      setProfile(result.data.user as typeof profile);
    }
    setIsLoading(false);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Profile</h1>
          <p className="text-[var(--color-text-secondary)]">Manage your account settings</p>
        </div>
        <Button variant="danger" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>

      {/* Profile Card */}
      <Card hover={false}>
        <div className="flex items-center gap-4 mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-accent)] text-[var(--color-bg)]">
            <span className="text-2xl font-bold">
              {profile?.name?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[var(--color-text)]">
              {profile?.name || "User"}
            </h2>
            <p className="text-[var(--color-text-secondary)]">{profile?.email}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
              <User className="h-4 w-4" />
              Full Name
            </label>
            <Input value={profile?.name || ""} disabled placeholder="Not set" />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
              <Mail className="h-4 w-4" />
              Email Address
            </label>
            <Input value={profile?.email || ""} disabled />
          </div>

          {/* Organization */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
              <Building className="h-4 w-4" />
              Organization
            </label>
            <Input value={profile?.organization || ""} disabled placeholder="Not set" />
          </div>

          {/* Member Since */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
            <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Member since</span>
            </div>
            <span className="text-sm text-[var(--color-text)]">{formatDate(profile?.created_at)}</span>
          </div>
        </div>
      </Card>

      {/* Security Section */}
      <Card hover={false}>
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-5 w-5 text-[var(--color-text-secondary)]" />
          <h3 className="font-semibold text-[var(--color-text)]">Security</h3>
        </div>
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          Your account is secured with a password. We recommend using a strong, unique password.
        </p>
        <Button variant="outline" disabled>
          Change Password (Coming Soon)
        </Button>
      </Card>
    </div>
  );
}
