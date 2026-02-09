import { useState } from "react";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { Sidebar } from "./components/layout/Sidebar";
import { Scanner } from "./pages/Scanner";
import { Dashboard } from "./pages/Dashboard";
import { History } from "./pages/History";
import { Wordlists } from "./pages/Wordlists";
import { Settings } from "./pages/Settings";
import { useTheme } from "./hooks/useTheme";

const pageMap = {
  Scanner,
  Dashboard,
  History,
  Wordlists,
  Settings
};

export default function App() {
  useTheme();
  const [active, setActive] = useState<keyof typeof pageMap>("Scanner");
  const Page = pageMap[active];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header active={active} onNavigate={(value) => setActive(value as keyof typeof pageMap)} />
      <main className="mx-auto flex max-w-6xl gap-6 px-6 py-8">
        <div className="flex-1 space-y-6">
          <Page />
        </div>
        <Sidebar />
      </main>
      <Footer />
    </div>
  );
}
