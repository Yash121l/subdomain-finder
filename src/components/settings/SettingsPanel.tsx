import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useSettingsStore } from "../../store/settingsStore";

export function SettingsPanel() {
  const defaultThreads = useSettingsStore((state) => state.defaultThreads);
  const defaultTimeout = useSettingsStore((state) => state.defaultTimeout);
  const updateSetting = useSettingsStore((state) => state.updateSetting);

  return (
    <Card>
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Defaults</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-slate-200">Default threads</label>
          <Input
            type="number"
            value={defaultThreads}
            onChange={(event) => updateSetting("defaultThreads", Number(event.target.value))}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-200">Default timeout</label>
          <Input
            type="number"
            value={defaultTimeout}
            onChange={(event) => updateSetting("defaultTimeout", Number(event.target.value))}
          />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button variant="outline">Export settings</Button>
        <Button variant="ghost">Reset defaults</Button>
      </div>
    </Card>
  );
}
