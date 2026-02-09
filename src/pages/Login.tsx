import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import { Lock, Mail, UserPlus, LogIn, User, Building } from "lucide-react";

export function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    organization: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = isRegister
      ? await register(formData.email, formData.password)
      : await login(formData.email, formData.password);

    setIsLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      navigate("/scan");
    }
  };

  return (
    <div className="flex items-center justify-center py-12 animate-fade-in">
      <div className="w-full max-w-[420px] mx-auto px-4">
        <Card className="p-8" hover={false}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-accent)] text-[var(--color-bg)] mb-5">
              <Lock className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">
              {isRegister ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-2">
              {isRegister
                ? "Sign up to save your scan history"
                : "Sign in to access your scans"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {isRegister && (
              <>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text)]">
                    <User className="h-4 w-4 text-[var(--color-text-muted)]" />
                    Full Name
                  </label>
                  <Input
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required={isRegister}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text)]">
                    <Building className="h-4 w-4 text-[var(--color-text-muted)]" />
                    Organization
                    <span className="text-[var(--color-text-muted)] font-normal">(optional)</span>
                  </label>
                  <Input
                    name="organization"
                    type="text"
                    placeholder="Acme Inc."
                    value={formData.organization}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text)]">
                <Mail className="h-4 w-4 text-[var(--color-text-muted)]" />
                Email
              </label>
              <Input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text)]">
                <Lock className="h-4 w-4 text-[var(--color-text-muted)]" />
                Password
              </label>
              <Input
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
              {isRegister && (
                <p className="text-xs text-[var(--color-text-muted)]">Must be at least 6 characters</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base mt-2"
              loading={isLoading}
            >
              {isRegister ? (
                <>
                  <UserPlus className="h-4 w-4" />
                  Create Account
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-[var(--color-border)] text-center">
            <button
              type="button"
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
            >
              {isRegister
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
