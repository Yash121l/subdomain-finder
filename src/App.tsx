import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { Scanner } from "./pages/Scanner";
import { Settings } from "./pages/Settings";
import { WhatIsSubdomainLookup } from "./pages/WhatIsSubdomainLookup";
import { SubdomainEnumerationGuide } from "./pages/SubdomainEnumerationGuide";
import { useTheme } from "./hooks/useTheme";

const routes = [
  { path: "/", name: "Home", component: () => <Navigate to="/scan" replace /> },
  { path: "/scan", name: "Scanner", component: Scanner },
  { path: "/scan/:domain", name: "Scanner", component: Scanner },
  { path: "/settings", name: "Settings", component: Settings },
  { path: "/what-is-subdomain-lookup", name: "What is Subdomain Lookup", component: WhatIsSubdomainLookup },
  { path: "/subdomain-enumeration-guide", name: "Subdomain Enumeration Guide", component: SubdomainEnumerationGuide },
];

function getActiveFromPath(pathname: string): string {
  if (pathname === "/") return "Scanner";
  if (pathname.startsWith("/scan")) return "Scanner";
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
      Settings: "/settings",
    };
    navigate(routeMap[value] || "/scan");
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-colors">
      <Header active={active} onNavigate={handleNavigate} />
      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        <div className="w-full">
          <Routes>
            {routes.map((route) => (
              <Route key={route.path} path={route.path} element={<route.component />} />
            ))}
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  );
}
