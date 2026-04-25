import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { Sidebar } from "./components/layout/Sidebar";
import { Scanner } from "./pages/Scanner";
import { Settings } from "./pages/Settings";
import { useTheme } from "./hooks/useTheme";

const routes = [
  { path: "/", name: "Home", component: () => <Navigate to="/scan" replace />, showSidebar: false },
  { path: "/scan", name: "Scanner", component: Scanner, showSidebar: true },
  { path: "/scan/:domain", name: "Scanner", component: Scanner, showSidebar: true },
  { path: "/settings", name: "Settings", component: Settings, showSidebar: false },
];

function getActiveFromPath(pathname: string): string {
  if (pathname === "/") return "Scanner";
  if (pathname.startsWith("/scan")) return "Scanner";
  if (pathname === "/settings") return "Settings";
  return "Scanner";
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
      Scanner: "/scan",
      Settings: "/settings",
    };
    navigate(routeMap[value] || "/scan");
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
