import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { Sidebar } from "./components/layout/Sidebar";
import { Scanner } from "./pages/Scanner";
import { Dashboard } from "./pages/Dashboard";
import { History } from "./pages/History";
import { Wordlists } from "./pages/Wordlists";
import { Settings } from "./pages/Settings";
import { useTheme } from "./hooks/useTheme";

const routes = [
  { path: "/", name: "Scanner", component: Scanner },
  { path: "/scan", name: "Scanner", component: Scanner },
  { path: "/scan/:domain", name: "Scanner", component: Scanner },
  { path: "/dashboard", name: "Dashboard", component: Dashboard },
  { path: "/history", name: "History", component: History },
  { path: "/wordlists", name: "Wordlists", component: Wordlists },
  { path: "/settings", name: "Settings", component: Settings },
];

function getActiveFromPath(pathname: string): string {
  if (pathname === "/" || pathname.startsWith("/scan")) return "Scanner";
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname === "/history") return "History";
  if (pathname === "/wordlists") return "Wordlists";
  if (pathname === "/settings") return "Settings";
  return "Scanner";
}

export default function App() {
  useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const active = getActiveFromPath(location.pathname);

  const handleNavigate = (value: string) => {
    const routeMap: Record<string, string> = {
      Scanner: "/scan",
      Dashboard: "/dashboard",
      History: "/history",
      Wordlists: "/wordlists",
      Settings: "/settings",
    };
    navigate(routeMap[value] || "/scan");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header active={active} onNavigate={handleNavigate} />
      <main className="mx-auto flex max-w-6xl gap-6 px-6 py-8">
        <div className="flex-1 space-y-6">
          <Routes>
            {routes.map((route) => (
              <Route key={route.path} path={route.path} element={<route.component />} />
            ))}
          </Routes>
        </div>
        <Sidebar />
      </main>
      <Footer />
    </div>
  );
}
