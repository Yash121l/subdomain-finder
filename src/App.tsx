import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { Sidebar } from "./components/layout/Sidebar";
import { Scanner } from "./pages/Scanner";
import { Dashboard } from "./pages/Dashboard";
import { History } from "./pages/History";
import { Wordlists } from "./pages/Wordlists";
import { Settings } from "./pages/Settings";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile";
import { useTheme } from "./hooks/useTheme";

const routes = [
  { path: "/", name: "Scanner", component: Scanner, showSidebar: true },
  { path: "/scan", name: "Scanner", component: Scanner, showSidebar: true },
  { path: "/scan/:domain", name: "Scanner", component: Scanner, showSidebar: true },
  { path: "/dashboard", name: "Dashboard", component: Dashboard, showSidebar: true },
  { path: "/history", name: "History", component: History, showSidebar: false },
  { path: "/wordlists", name: "Wordlists", component: Wordlists, showSidebar: false },
  { path: "/settings", name: "Settings", component: Settings, showSidebar: false },
  { path: "/login", name: "Login", component: Login, showSidebar: false },
  { path: "/profile", name: "Profile", component: Profile, showSidebar: false },
];

function getActiveFromPath(pathname: string): string {
  if (pathname === "/" || pathname.startsWith("/scan")) return "Scanner";
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname === "/history") return "History";
  if (pathname === "/wordlists") return "Wordlists";
  if (pathname === "/settings") return "Settings";
  if (pathname === "/login") return "Login";
  if (pathname === "/profile") return "Profile";
  return "Scanner";
}

function shouldShowSidebar(pathname: string): boolean {
  const route = routes.find(r => r.path === pathname || (r.path.includes(":") && pathname.startsWith(r.path.split(":")[0])));
  return route?.showSidebar ?? false;
}

export default function App() {
  useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const active = getActiveFromPath(location.pathname);
  const showSidebar = shouldShowSidebar(location.pathname);

  const handleNavigate = (value: string) => {
    const routeMap: Record<string, string> = {
      Scanner: "/scan",
      Dashboard: "/dashboard",
      History: "/history",
      Wordlists: "/wordlists",
      Settings: "/settings",
      Login: "/login",
      Profile: "/profile",
    };
    navigate(routeMap[value] || "/scan");
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-colors">
      <Header active={active} onNavigate={handleNavigate} />
      <main className="mx-auto flex max-w-6xl gap-8 px-6 py-8">
        <div className="flex-1">
          <Routes>
            {routes.map((route) => (
              <Route key={route.path} path={route.path} element={<route.component />} />
            ))}
          </Routes>
        </div>
        {showSidebar && <Sidebar />}
      </main>
      <Footer />
    </div>
  );
}
