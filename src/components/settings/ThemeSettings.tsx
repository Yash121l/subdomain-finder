import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { useSettingsStore } from "../../store/settingsStore";

export function ThemeSettings() {
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);

  return (
    <Card>
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Theme</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {["light", "dark", "system"].map((mode) => (
          <Button
            key={mode}
            variant={theme === mode ? "primary" : "outline"}
            onClick={() => setTheme(mode as typeof theme)}
          >
            {mode}
          </Button>
        ))}
      </div>
    </Card>
  );
}
