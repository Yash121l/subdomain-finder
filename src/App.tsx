import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { Sidebar } from "./components/layout/Sidebar";
import { Landing } from "./pages/Landing";
import { Scanner } from "./pages/Scanner";
import { Dashboard } from "./pages/Dashboard";
import { History } from "./pages/History";
import { Settings } from "./pages/Settings";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile";
import { useTheme } from "./hooks/useTheme";

const routes = [
  { path: "/", name: "Home", component: Landing, showSidebar: false },
  { path: "/scan", name: "Scanner", component: Scanner, showSidebar: true },
  { path: "/scan/:domain", name: "Scanner", component: Scanner, showSidebar: true },
  { path: "/dashboard", name: "Dashboard", component: Dashboard, showSidebar: false },
  { path: "/history", name: "History", component: History, showSidebar: false },
  { path: "/settings", name: "Settings", component: Settings, showSidebar: false },
  { path: "/login", name: "Login", component: Login, showSidebar: false },
  { path: "/profile", name: "Profile", component: Profile, showSidebar: false },
];

function getActiveFromPath(pathname: string): string {
  if (pathname === "/") return "Home";
  if (pathname.startsWith("/scan")) return "Scanner";
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname === "/history") return "History";
  if (pathname === "/settings") return "Settings";
  if (pathname === "/login") return "Login";
  if (pathname === "/profile") return "Profile";
  return "Home";
}

function shouldShowSidebar(pathname: string): boolean {
  if (pathname === "/scan" || pathname.startsWith("/scan/")) return true;
  return false;
}

export default function App() {
  useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const active = getActiveFromPath(location.pathname);
  const showSidebar = shouldShowSidebar(location.pathname);

  const handleNavigate = (value: string) => {
    const routeMap: Record<string, string> = {
      Home: "/",
      Scanner: "/scan",
      Dashboard: "/dashboard",
      History: "/history",
      Settings: "/settings",
      Login: "/login",
      Profile: "/profile",
    };
    navigate(routeMap[value] || "/");
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-colors">
      <Header active={active} onNavigate={handleNavigate} />
      <main className="mx-auto flex max-w-6xl flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        <div className="flex-1 min-w-0">
          <Routes>
            {routes.map((route) => (
              <Route key={route.path} path={route.path} element={<route.component />} />
            ))}
          </Routes>
        </div>
        {showSidebar && (
          <div className="w-full lg:w-80 shrink-0 order-first lg:order-last">
            <Sidebar />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
