import { useState } from "react";
import { Moon, Sun, Github, User, LogOut, LogIn, Menu, X } from "lucide-react";
import { Button } from "../ui/button";
import { useSettingsStore } from "../../store/settingsStore";
import { useAuth } from "../../context/AuthContext";

type HeaderProps = {
  active: string;
  onNavigate: (value: string) => void;
};

export function Header({ active, onNavigate }: HeaderProps) {
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const navItems = isAuthenticated 
    ? ["Scanner", "Dashboard", "History"] 
    : ["Scanner"];

  const handleNavClick = (item: string) => {
    onNavigate(item);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 h-16">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => handleNavClick("Home")}>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent)] text-[var(--color-bg)]">
            <span className="text-sm font-bold">SF</span>
          </div>
          <span className="font-semibold text-[var(--color-text)] hidden xs:block">
            Subdomain Finder
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-1">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => handleNavClick(item)}
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

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => handleNavClick("Profile")}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="max-w-[100px] truncate">{user?.email?.split("@")[0]}</span>
              </button>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut size={16} />
              </Button>
            </>
          ) : (
            <Button variant="primary" size="sm" onClick={() => handleNavClick("Login")}>
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
            href="https://github.com/Yash121l/subdomain-finder"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
          >
            <Github size={18} />
          </a>
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-1">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-bg)] animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => handleNavClick(item)}
                className={`w-full text-left px-4 py-3 text-sm rounded-lg transition-colors ${
                  active === item 
                    ? "text-[var(--color-text)] bg-[var(--color-bg-tertiary)]" 
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-tertiary)]"
                }`}
              >
                {item}
              </button>
            ))}
            <div className="pt-2 border-t border-[var(--color-border)] mt-2">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => handleNavClick("Profile")}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-tertiary)] rounded-lg transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </button>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-[var(--color-bg-tertiary)] rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleNavClick("Login")}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-text)] bg-[var(--color-accent)] hover:opacity-90 rounded-lg transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
