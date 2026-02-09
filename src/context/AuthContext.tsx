import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { apiClient } from "../lib/api";

type User = {
  id: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = apiClient.getToken();
      if (token) {
        const result = await apiClient.getMe();
        if (result.data?.user) {
          setUser(result.data.user);
        } else {
          apiClient.setToken(null);
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await apiClient.login(email, password);
    if (result.data) {
      apiClient.setToken(result.data.token);
      setUser(result.data.user);
      return {};
    }
    return { error: result.error };
  };

  const register = async (email: string, password: string) => {
    const result = await apiClient.register(email, password);
    if (result.data) {
      apiClient.setToken(result.data.token);
      setUser(result.data.user);
      return {};
    }
    return { error: result.error };
  };

  const logout = () => {
    apiClient.setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
