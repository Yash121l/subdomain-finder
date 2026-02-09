import { create } from "zustand";

export type HistoryEntry = {
  id: string;
  domain: string;
  date: string;
  results: number;
  duration: string;
  status: "completed" | "failed";
};

type HistoryState = {
  entries: HistoryEntry[];
  addEntry: (entry: HistoryEntry) => void;
  removeEntry: (id: string) => void;
};

export const useHistoryStore = create<HistoryState>((set) => ({
  entries: [
    {
      id: "1",
      domain: "example.com",
      date: "2024-08-01 10:21",
      results: 184,
      duration: "3m 42s",
      status: "completed"
    },
    {
      id: "2",
      domain: "sample.org",
      date: "2024-08-03 14:02",
      results: 62,
      duration: "1m 18s",
      status: "failed"
    }
  ],
  addEntry: (entry) => set((state) => ({ entries: [entry, ...state.entries] })),
  removeEntry: (id) => set((state) => ({ entries: state.entries.filter((entry) => entry.id !== id) }))
}));
