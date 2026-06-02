/**
 * AdminLayout.jsx
 * ─────────────────────────────────────────────
 * Root admin shell — collapsible sidebar + sticky header + <Outlet />.
 * Sidebar collapses to icon-only rail when closed (ChatGPT style).
 *
 * TODO (Backend integration):
 *   - Replace static user info with `useAuth()` user object
 *   - Add route guards: redirect to /login if user.role !== 'admin'
 */

import { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiPackage,
  FiShoppingCart,
  FiUsers,
  FiSettings,
  FiSearch,
  FiMoon,
  FiSun,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
  FiChevronDown,
  FiMenu,
  FiBell,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

/* ── Navigation items ───────────────────────── */
const NAV_ITEMS = [
  { label: "Dashboard",  path: "/admin/dashboard",  Icon: FiGrid },
  { label: "Products",   path: "/admin/products",   Icon: FiPackage },
  { label: "Orders",     path: "/admin/orders",     Icon: FiShoppingCart },
  { label: "Customers",  path: "/admin/customers",  Icon: FiUsers },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode]       = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userMenuRef = useRef(null);
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') {
        toast.error("Access denied. Admin authorization required.");
        navigate("/login", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  /* Close user-menu on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const getUserInitials = (name) => {
    if (!name) return "A";
    const parts = name.trim().split(" ");
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  /* ── Sidebar width tokens ───────────────────── */
  const sidebarW   = sidebarOpen ? "w-[220px]" : "w-[64px]";
  const mainLeft   = sidebarOpen ? "ml-[220px]" : "ml-[64px]";

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f0f13] text-[#e8e3f0] font-sans">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#7c5cbf] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xs font-bold tracking-wider uppercase text-[#6b7280]">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f0f13] text-[#e8e3f0] font-sans">

      {/* ═══════════════════════════════════════════
          SIDEBAR
      ═══════════════════════════════════════════ */}
      <aside
        className={`
          fixed left-0 top-0 h-full z-40 flex flex-col
          bg-[#131318] border-r border-white/[0.06]
          transition-all duration-300 ease-in-out overflow-hidden
          ${sidebarW}
        `}
      >
        {/* Logo row */}
        <div className="flex items-center gap-3 h-[60px] px-4 shrink-0 border-b border-white/[0.06]">
          {/* Brand mark */}
            <img src="/Logo.png" alt="" className="rounded-lg w-10" />

          {/* Brand label — hidden when collapsed */}
          <span
            className={`text-white font-extrabold text-[15px] tracking-tight whitespace-nowrap transition-all duration-300 overflow-hidden
              ${sidebarOpen ? "opacity-100 max-w-[140px]" : "opacity-0 max-w-0"}`}
          >
            PEAK Admin
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map(({ label, path, Icon }) => (
            <NavLink
              key={path}
              to={path}
              title={!sidebarOpen ? label : undefined}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl
                text-sm font-semibold transition-all duration-200 cursor-pointer no-underline
                ${isActive
                  ? "bg-[#4f378a]/30 text-[#c8b7ff] border border-[#7c5cbf]/30"
                  : "text-[#9ca3af] hover:bg-white/[0.06] hover:text-[#e8e3f0]"
                }
              `}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span
                className={`whitespace-nowrap transition-all duration-300 overflow-hidden
                  ${sidebarOpen ? "opacity-100 max-w-[140px]" : "opacity-0 max-w-0"}`}
              >
                {label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom: Settings + Collapse Toggle */}
        <div className="px-2 pb-4 space-y-0.5 border-t border-white/[0.06] pt-3 shrink-0">
          

          {/* Collapse / Expand toggle button */}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            className="
              flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
              text-[#9ca3af] hover:bg-white/[0.06] hover:text-[#e8e3f0]
              transition-all duration-200 cursor-pointer border-none bg-transparent text-sm font-semibold
            "
          >
            {sidebarOpen
              ? <FiChevronLeft className="w-[18px] h-[18px] shrink-0" />
              : <FiChevronRight className="w-[18px] h-[18px] shrink-0" />
            }
            <span
              className={`whitespace-nowrap transition-all duration-300 overflow-hidden
                ${sidebarOpen ? "opacity-100 max-w-[140px]" : "opacity-0 max-w-0"}`}
            >
              Collapse
            </span>
          </button>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════
          MAIN AREA (header + page content)
      ═══════════════════════════════════════════ */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${mainLeft}`}>

        {/* ── Sticky Top Header ─────────────────── */}
        <header className="sticky top-0 z-30 h-[60px] bg-[#131318]/90 backdrop-blur-md border-b border-white/[0.06] flex items-center px-6 gap-4 shrink-0">


          {/* Spacer */}
          <div className="flex-1" />

          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode((v) => !v)}
            className="p-2 rounded-xl text-[#9ca3af] hover:text-[#e8e3f0] hover:bg-white/[0.06] transition-all border-none bg-transparent cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <FiMoon className="w-5 h-5" /> : <FiSun className="w-5 h-5" />}
          </button>

          {/* Notification bell — placeholder */}
          <button
            className="p-2 rounded-xl text-[#9ca3af] hover:text-[#e8e3f0] hover:bg-white/[0.06] transition-all border-none bg-transparent cursor-pointer relative"
            aria-label="Notifications"
            onClick={() => toast.info("Notifications coming soon")}
          >
            <FiBell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#7c5cbf] rounded-full border border-[#131318]" />
          </button>

          {/* User avatar dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/[0.06] transition-all cursor-pointer border-none bg-transparent"
              aria-label="User menu"
            >
              <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c5cbf] to-[#4f378a] text-white text-xs font-extrabold flex items-center justify-center shadow-md">
                {getUserInitials(user?.name || "Admin")}
              </span>
              <FiChevronDown
                className={`w-4 h-4 text-[#6b7280] transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-[200px] bg-[#1e1e2a] border border-white/[0.08] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] py-2 z-50">
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <p className="text-sm font-extrabold text-[#e8e3f0] truncate">{user?.name || "Admin"}</p>
                  <p className="text-xs text-[#6b7280] truncate mt-0.5">{user?.email || "admin@peak.com"}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[#f87171] hover:bg-white/[0.05] transition-colors cursor-pointer border-none bg-transparent text-left"
                  >
                    <FiLogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* ── Page Content (Outlet) ──────────────── */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
