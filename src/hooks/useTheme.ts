import { useEffect } from "react";
import { useSettingsStore } from "../store/settingsStore";

export function useTheme() {
  const theme = useSettingsStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      root.classList.remove("dark");
      root.classList.remove("light");
      return;
    }

    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
  }, [theme]);
}
