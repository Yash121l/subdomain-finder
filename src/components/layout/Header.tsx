import { Moon, Sun, Github, User, LogOut, LogIn } from "lucide-react";
import { Button } from "../ui/button";
import { useSettingsStore } from "../../store/settingsStore";
import { useAuth } from "../../context/AuthContext";

const navItems = ["Scanner", "Dashboard", "History"];

type HeaderProps = {
  active: string;
  onNavigate: (value: string) => void;
};

export function Header({ active, onNavigate }: HeaderProps) {
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const { user, isAuthenticated, logout } = useAuth();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 h-16">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate("Scanner")}>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent)] text-[var(--color-bg)]">
            <span className="text-sm font-bold">SF</span>
          </div>
          <span className="font-semibold text-[var(--color-text)]">
            Subdomain Finder
          </span>
        </div>

        {/* Navigation */}
        <nav className="hidden gap-1 lg:flex">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => onNavigate(item)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                active === item 
                  ? "text-[var(--color-text)] bg-[var(--color-bg-tertiary)]" 
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => onNavigate("Profile")}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="max-w-[100px] truncate">{user?.email?.split("@")[0]}</span>
              </button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={logout}
              >
                <LogOut size={16} />
              </Button>
            </>
          ) : (
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => onNavigate("Login")}
            >
              <LogIn size={16} />
              Sign In
            </Button>
          )}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
          >
            <Github size={18} />
          </a>
        </div>
      </div>
    </header>
  );
}
