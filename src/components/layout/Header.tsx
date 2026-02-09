import { Moon, Settings, Sun } from "lucide-react";
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
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10 text-primary-300">
            <span className="text-lg font-bold">SF</span>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Subdomain Finder</p>
            <p className="text-lg font-semibold">Command Center</p>
          </div>
        </div>
        <nav className="hidden gap-2 lg:flex">
          {navItems.map((item) => (
            <Button
              key={item}
              variant={active === item ? "primary" : "ghost"}
              onClick={() => onNavigate(item)}
              className="text-xs uppercase tracking-wide"
            >
              {item}
            </Button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
          <Button variant="outline" aria-label="Settings">
            <Settings size={16} />
          </Button>
        </div>
      </div>
    </header>
  );
}
