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
    <div className="min-h-[60vh] flex items-center justify-center animate-fade-in">
      <Card className="w-full max-w-md mx-auto" hover={false}>
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white mb-4">
            <Lock className="h-7 w-7 text-black" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            {isRegister ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-sm text-[#888] mt-2">
            {isRegister
              ? "Sign up to save your scan history"
              : "Sign in to access your scans"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {isRegister && (
            <>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-[#888]">
                  <User className="h-4 w-4" />
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
                <label className="flex items-center gap-2 text-sm font-medium text-[#888]">
                  <Building className="h-4 w-4" />
                  Organization <span className="text-[#555]">(optional)</span>
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
            <label className="flex items-center gap-2 text-sm font-medium text-[#888]">
              <Mail className="h-4 w-4" />
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
            <label className="flex items-center gap-2 text-sm font-medium text-[#888]">
              <Lock className="h-4 w-4" />
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
              <p className="text-xs text-[#555]">Must be at least 6 characters</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-11"
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

        <div className="mt-6 pt-6 border-t border-[#222] text-center">
          <button
            type="button"
            className="text-sm text-[#888] hover:text-white transition-colors"
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
  );
}
