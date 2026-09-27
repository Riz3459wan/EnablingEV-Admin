import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import AdminNavbar from "./AdminNavbar";
import Sidebar from "./Sidebar";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const smoothEase = "cubic-bezier(0.4, 0, 0.2, 1)";

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
      />

      <AdminNavbar
        onMenuClick={() => setSidebarOpen(true)}
        sidebarLeftClass={sidebarCollapsed ? "lg:left-20" : "lg:left-64"}
        smoothEase={smoothEase}
      />

      <main
        style={{
          transitionProperty: "padding-left",
          transitionDuration: "300ms",
          transitionTimingFunction: smoothEase,
        }}
        className={`pt-16 sm:pt-20 min-h-screen ${
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <div key={location.pathname} className="p-4 sm:p-6 page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
