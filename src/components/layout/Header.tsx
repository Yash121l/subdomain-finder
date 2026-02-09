import { Moon, Sun, Github } from "lucide-react";
import { Button } from "../ui/button";
import { useSettingsStore } from "../../store/settingsStore";

const navItems = ["Scanner", "Dashboard", "History", "Wordlists", "Settings"];

type HeaderProps = {
  active: string;
  onNavigate: (value: string) => void;
};

export function Header({ active, onNavigate }: HeaderProps) {
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-20 glass-heavy border-b border-slate-800/50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 shadow-lg shadow-indigo-500/30">
            <span className="text-lg font-bold text-white">SF</span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 opacity-50 blur-lg" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">
              Subdomain
            </p>
            <p className="text-lg font-bold text-gradient">
              Finder
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden gap-1 lg:flex">
          {navItems.map((item) => (
            <Button
              key={item}
              variant={active === item ? "primary" : "ghost"}
              size="sm"
              onClick={() => onNavigate(item)}
              className={active === item 
                ? "shadow-md shadow-indigo-500/20" 
                : "hover:text-slate-200"
              }
            >
              {item}
            </Button>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleTheme} 
            aria-label="Toggle theme"
            className="h-9 w-9 p-0"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex"
          >
            <Button variant="outline" size="sm" className="h-9 w-9 p-0">
              <Github size={16} />
            </Button>
          </a>
        </div>
      </div>
    </header>
  );
}
