import { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  FiGrid,
  FiPackage,
  FiShoppingCart,
  FiUsers,
  FiMoon,
  FiSun,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
  FiChevronDown,
  FiBell,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

/* ── Navigation items matching Stitch screens ───────────────── */
const NAV_ITEMS = [
  { label: "Dashboard", path: "/admin/dashboard", Icon: FiGrid },
  { label: "Products", path: "/admin/products", Icon: FiPackage },
  { label: "Orders", path: "/admin/orders", Icon: FiShoppingCart },
  { label: "Customers", path: "/admin/customers", Icon: FiUsers },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("admin_theme");
    return saved ? saved === "dark" : true;
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userMenuRef = useRef(null);
  const mainScrollRef = useRef(null);
  const location = useLocation();
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  // Sync dark mode class with <html> element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("admin_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("admin_theme", "light");
    }
  }, [darkMode]);

  // Scroll to top on route change
  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Auth Guard
  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== "admin") {
        toast.error("Access denied. Admin authorization required.");
        navigate("/login", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  // Close user-menu on click outside
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

  const sidebarW = sidebarOpen ? "w-[220px]" : "w-[64px]";
  const mainLeft = sidebarOpen ? "md:ml-[220px]" : "md:ml-[64px]";

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc] dark:bg-[#131315] text-slate-900 dark:text-[#e5e1e4]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#7c3aed] dark:border-[#d0bcff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-[#9ca3af]">
            Verifying credentials...
          </p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] dark:bg-[#131315] text-slate-900 dark:text-[#e5e1e4] font-sans transition-colors duration-200">
      {/* ═══════════════════════════════════════════
          DESKTOP SIDEBAR (md+)
      ═══════════════════════════════════════════ */}
      <aside
        className={`
          hidden md:flex fixed left-0 top-0 h-full z-40 flex-col
          bg-white dark:bg-[#1b1b1d] border-r border-slate-200 dark:border-white/10
          transition-all duration-300 ease-in-out overflow-hidden
          ${sidebarW}
        `}
      >
        {/* Logo Header */}
        <div className="flex items-center gap-3 h-16 px-4 shrink-0 border-b border-slate-200 dark:border-white/10">
          <img src="/Logo.png" alt="PEAK" className="rounded-lg w-9 h-9 object-cover shrink-0" />
          <span
            className={`text-slate-900 dark:text-white font-extrabold text-[15px] tracking-tight whitespace-nowrap transition-all duration-300 overflow-hidden ${
              sidebarOpen ? "opacity-100 max-w-[140px]" : "opacity-0 max-w-0"
            }`}
          >
            PEAK Admin
          </span>
        </div>

        {/* Desktop Nav links */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map(({ label, path, Icon }) => (
            <NavLink
              key={path}
              to={path}
              title={!sidebarOpen ? label : undefined}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl
                text-sm font-semibold transition-all duration-200 cursor-pointer no-underline
                ${
                  isActive
                    ? "bg-[#7c3aed]/10 dark:bg-[#d0bcff]/15 text-[#7c3aed] dark:text-[#d0bcff] font-bold border border-[#7c3aed]/20 dark:border-[#d0bcff]/20 shadow-xs"
                    : "text-slate-600 dark:text-[#9ca3af] hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-[#e5e1e4]"
                }
              `}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span
                className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${
                  sidebarOpen ? "opacity-100 max-w-[140px]" : "opacity-0 max-w-0"
                }`}
              >
                {label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Collapse button */}
        <div className="px-2 pb-4 border-t border-slate-200 dark:border-white/10 pt-3 shrink-0">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-500 dark:text-[#9ca3af] hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-[#e5e1e4] transition-all duration-200 cursor-pointer border-none bg-transparent text-sm font-semibold"
          >
            {sidebarOpen ? (
              <FiChevronLeft className="w-[18px] h-[18px] shrink-0" />
            ) : (
              <FiChevronRight className="w-[18px] h-[18px] shrink-0" />
            )}
            <span
              className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${
                sidebarOpen ? "opacity-100 max-w-[140px]" : "opacity-0 max-w-0"
              }`}
            >
              Collapse
            </span>
          </button>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════
          MAIN AREA (Header + Content + Mobile Bottom Nav)
      ═══════════════════════════════════════════ */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${mainLeft}`}>
        {/* ── Sticky Top Header ─────────────────── */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-[#131315]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 flex items-center px-4 sm:px-6 gap-3 shrink-0">
          {/* Mobile Brand Mark */}
          <div className="flex md:hidden items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#7c3aed] dark:bg-[#d0bcff] flex items-center justify-center shadow-xs">
              <span className="text-white dark:text-[#131315] font-extrabold text-xs">P</span>
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
              PEAK Admin
            </span>
          </div>

          <div className="flex-1" />

          {/* Dark / Light mode toggle button */}
          <button
            onClick={() => setDarkMode((v) => !v)}
            className="p-2.5 rounded-full text-slate-600 dark:text-[#cbc3d7] hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-all border-none bg-transparent cursor-pointer"
            aria-label="Toggle theme"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <FiSun className="w-5 h-5 text-amber-400" /> : <FiMoon className="w-5 h-5 text-slate-700" />}
          </button>

          {/* Notifications */}
          <button
            className="p-2.5 rounded-full text-slate-600 dark:text-[#cbc3d7] hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-all border-none bg-transparent cursor-pointer relative"
            aria-label="Notifications"
            onClick={() => toast.info("Notifications system active")}
          >
            <FiBell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#7c3aed] dark:bg-[#4edea3] rounded-full border border-white dark:border-[#131315]" />
          </button>

          {/* User Profile menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all cursor-pointer border-none bg-transparent"
              aria-label="User menu"
            >
              <span className="w-8 h-8 rounded-full bg-[#7c3aed] dark:bg-[#d0bcff] text-white dark:text-[#131315] text-xs font-extrabold flex items-center justify-center shadow-sm">
                {getUserInitials(user?.name || "Admin")}
              </span>
              <FiChevronDown
                className={`w-4 h-4 text-slate-500 dark:text-[#9ca3af] transition-transform duration-200 hidden sm:block ${
                  userMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#1b1b1d] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl py-2 z-50 text-left">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-white/10">
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                    {user?.name || "Admin"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-[#9ca3af] truncate mt-0.5">
                    {user?.email || "admin@peak.com"}
                  </p>
                </div>
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer border-none bg-transparent text-left"
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
        <main ref={mainScrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-28 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* ═══════════════════════════════════════════
          MOBILE BOTTOM NAVIGATION BAR (md:hidden)
          Matches Stitch Mobile navigation design
      ═══════════════════════════════════════════ */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/90 dark:bg-[#1b1b1d]/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 h-16 flex items-center justify-around px-2 pb-safe shadow-lg">
        {NAV_ITEMS.map(({ label, path, Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `
              flex flex-col items-center justify-center flex-1 h-full cursor-pointer no-underline transition-colors
              ${
                isActive
                  ? "text-[#7c3aed] dark:text-[#d0bcff] font-bold"
                  : "text-slate-500 dark:text-[#9ca3af] hover:text-slate-900 dark:hover:text-[#e5e1e4]"
              }
            `}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
