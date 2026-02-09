import { create } from "zustand";

export type ThemeMode = "light" | "dark" | "system";

type SettingsState = {
  apiEndpoint: string;
  defaultThreads: number;
  defaultTimeout: number;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  updateSetting: (key: "apiEndpoint" | "defaultThreads" | "defaultTimeout", value: string | number) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  apiEndpoint: "https://api.subdomainfinder.dev",
  defaultThreads: 50,
  defaultTimeout: 5,
  theme: "dark",
  setTheme: (theme) => set({ theme }),
  updateSetting: (key, value) => set((state) => ({ ...state, [key]: value }))
}));
