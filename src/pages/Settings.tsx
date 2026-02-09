import { SettingsPanel } from "../components/settings/SettingsPanel";
import { ThemeSettings } from "../components/settings/ThemeSettings";
import { APISettings } from "../components/settings/APISettings";

export function Settings() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-4">
        <SettingsPanel />
        <APISettings />
      </div>
      <ThemeSettings />
    </div>
  );
}
