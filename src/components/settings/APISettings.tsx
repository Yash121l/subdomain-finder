import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { useSettingsStore } from "../../store/settingsStore";

export function APISettings() {
  const apiEndpoint = useSettingsStore((state) => state.apiEndpoint);
  const updateSetting = useSettingsStore((state) => state.updateSetting);

  return (
    <Card>
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">API configuration</p>
      <div className="mt-4 space-y-3">
        <label className="text-sm text-slate-200">Endpoint</label>
        <Input
          value={apiEndpoint}
          onChange={(event) => updateSetting("apiEndpoint", event.target.value)}
        />
      </div>
    </Card>
  );
}
