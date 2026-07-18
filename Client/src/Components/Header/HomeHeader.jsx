import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FiSearch, FiHeart, FiLogOut, FiUser, FiChevronDown, FiPackage, FiMenu, FiX } from "react-icons/fi";
import { BsCart3 } from "react-icons/bs";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

export default function HomeHeader() {
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { wishlist, setIsOpen: openWishlist } = useWishlist();
  const { cart, setIsOpen: openCart } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  const cartCount = cart.length;

  // Close desktop user-menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when desktop search bar opens
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleLogout = async () => {
    setShowUserMenu(false);
    setMobileOpen(false);
    await logout();
    toast.success("You've been logged out successfully.");
    navigate("/");
  };

  const navLinks = [
    { label: "Collections", path: "/" },
    { label: "Shop All", path: "/shop-all" },
    { label: "Our Story", path: "/story" },
    { label: "Contact Us", path: "/contact-us" },
  ];

  const getUserInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    navigate(trimmed ? `/shop-all?search=${encodeURIComponent(trimmed)}` : "/shop-all");
    setShowSearch(false);
    setSearchQuery("");
  };

  const handleMobileSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = mobileSearch.trim();
    navigate(trimmed ? `/shop-all?search=${encodeURIComponent(trimmed)}` : "/shop-all");
    setMobileSearch("");
    setMobileOpen(false);
  };

  const toggleSearch = () => {
    if (showSearch) setSearchQuery("");
    setShowSearch((prev) => !prev);
  };

  const closeMobileAndNavigate = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-[#e6e0e9]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16 gap-4 lg:gap-10 relative">

          {/* Logo */}
          <Link
            to="/"
            className="text-[22px] font-extrabold tracking-wide text-[#1d1b20] shrink-0 hover:scale-110 transition-all duration-300"
          >
            PEAK
          </Link>

          {/* ── Desktop Nav (lg+) ───────────────────────────────── */}
          <div className="hidden lg:flex flex-1 justify-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                to={link.path}
                key={link.label}
                end={link.path === "/"}
                className={({ isActive }) =>
                  `text-xs font-semibold tracking-[0.1em] uppercase hover:scale-110 transition-all duration-300 pb-0.5 ${
                    isActive
                      ? "text-[#4f378a] border-b-2 border-[#4f378a]"
                      : "text-[#49454f] hover:text-[#4f378a]"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* ── Desktop Actions (lg+) ───────────────────────────── */}
          <div className="hidden lg:flex items-center gap-2 relative">
            {/* Search toggle */}
            <button
              onClick={toggleSearch}
              className="p-2 hover:scale-110 transition-all duration-300 bg-transparent border-none cursor-pointer"
              aria-label="Search"
            >
              <FiSearch size={20} color="#1d1b20" />
            </button>

            {/* Wishlist */}
            <button
              onClick={() => openWishlist(true)}
              className="p-2 hover:scale-110 transition-all duration-300 bg-transparent border-none cursor-pointer relative"
              aria-label="Open Wishlist"
            >
              <FiHeart size={20} color="#1d1b20" />
              {wishlist.length > 0 && (
                <span className="absolute top-0.5 right-0.5 w-[18px] h-[18px] bg-[#4f378a] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white leading-none">
                  {wishlist.length > 9 ? "9+" : wishlist.length}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => openCart(true)}
              className="p-2 hover:scale-110 transition-all duration-300 bg-transparent border-none cursor-pointer relative"
              aria-label="Open Cart"
            >
              <BsCart3 size={20} color="#1d1b20" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-[18px] h-[18px] bg-[#4f378a] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white leading-none">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>

            {/* User menu / Login */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu((prev) => !prev)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#f2ecf4] transition-all duration-300 cursor-pointer border-none bg-transparent"
                  aria-label="User menu"
                >
                  <span className="w-8 h-8 rounded-full bg-[#4f378a] text-white text-xs font-extrabold flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(79,55,138,0.3)]">
                    {getUserInitials(user.name)}
                  </span>
                  <span className="hidden sm:block text-sm font-bold text-[#1d1b20] max-w-[100px] truncate">
                    {user.name?.split(" ")[0]}
                  </span>
                  <FiChevronDown
                    className={`w-3.5 h-3.5 text-[#49454f] transition-transform duration-300 ${
                      showUserMenu ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-[220px] bg-white border border-[#e6e0e9] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.10)] py-2 z-50">
                    <div className="px-4 py-3 border-b border-[#f2ecf4]">
                      <p className="text-sm font-extrabold text-[#1d1b20] truncate">{user.name}</p>
                      <p className="text-xs text-[#49454f] truncate mt-0.5">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/orders"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#1d1b20] hover:bg-[#f2ecf4] transition-colors"
                      >
                        <FiPackage className="w-4 h-4" />
                        My Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#ba1a1a] hover:bg-[#ba1a1a]/5 transition-colors cursor-pointer border-none bg-transparent text-left"
                      >
                        <FiLogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-7 py-3 bg-[#4f378a] text-white text-sm font-bold rounded-xl hover:bg-[#5f479a] transition-all hover:scale-105 duration-300 shadow-[0_10px_30px_rgba(79,55,138,0.3)] no-underline"
              >
                Login
              </Link>
            )}

            {/* Desktop search input (slide in) */}
            <div
              className={`absolute right-52 top-1/2 -translate-y-1/2 transition-all duration-300 origin-right ${
                showSearch
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}
            >
              <form onSubmit={handleSearchSubmit}>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-[240px] px-4 py-2 rounded-xl border border-[#e6e0e9] shadow-sm outline-none text-sm text-[#1d1b20] bg-white focus:border-[#4f378a] transition-all"
                />
              </form>
            </div>
          </div>

          {/* ── Mobile / Tablet right-side icons (< lg) ─────────── */}
          <div className="flex lg:hidden items-center gap-1 ml-auto">
            {/* Wishlist */}
            <button
              onClick={() => openWishlist(true)}
              className="p-2 bg-transparent border-none cursor-pointer relative"
              aria-label="Open Wishlist"
            >
              <FiHeart size={20} color="#1d1b20" />
              {wishlist.length > 0 && (
                <span className="absolute top-0.5 right-0.5 w-[16px] h-[16px] bg-[#4f378a] text-white text-[8px] font-bold rounded-full flex items-center justify-center border-2 border-white leading-none">
                  {wishlist.length > 9 ? "9+" : wishlist.length}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => openCart(true)}
              className="p-2 bg-transparent border-none cursor-pointer relative"
              aria-label="Open Cart"
            >
              <BsCart3 size={20} color="#1d1b20" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-[16px] h-[16px] bg-[#4f378a] text-white text-[8px] font-bold rounded-full flex items-center justify-center border-2 border-white leading-none">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 bg-transparent border-none cursor-pointer"
              aria-label="Open menu"
            >
              <FiMenu size={22} color="#1d1b20" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Drawer Backdrop ─────────────────────────────── */}
      <div
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300 lg:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* ── Mobile Drawer Panel ────────────────────────────────── */}
      <div
        className={`fixed left-0 top-0 h-full w-[280px] sm:w-[320px] bg-white z-[70] shadow-2xl flex flex-col transition-transform duration-300 ease-out lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e6e0e9]">
          <span className="text-[20px] font-extrabold tracking-wide text-[#1d1b20]">PEAK</span>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-full bg-[#f2ecf4] border-none cursor-pointer flex items-center justify-center"
            aria-label="Close menu"
          >
            <FiX size={18} color="#1d1b20" />
          </button>
        </div>

        {/* Mobile search */}
        <div className="px-5 py-4 border-b border-[#e6e0e9]">
          <form onSubmit={handleMobileSearchSubmit} className="flex gap-2">
            <input
              type="text"
              value={mobileSearch}
              onChange={(e) => setMobileSearch(e.target.value)}
              placeholder="Search products..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#e6e0e9] outline-none text-sm text-[#1d1b20] bg-[#f9f7f5] focus:border-[#4f378a] transition-all"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-[#4f378a] text-white rounded-xl border-none cursor-pointer flex items-center justify-center"
              aria-label="Search"
            >
              <FiSearch size={16} />
            </button>
          </form>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#49454f] px-2 mb-3">
            Navigation
          </p>
          {navLinks.map((link) => (
            <NavLink
              to={link.path}
              key={link.label}
              end={link.path === "/"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-3 py-3 mb-1 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                  isActive
                    ? "bg-[#f2ecf4] text-[#4f378a]"
                    : "text-[#1d1b20] hover:bg-[#f9f7f5]"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* User section at bottom */}
        <div className="border-t border-[#e6e0e9] p-4">
          {user ? (
            <div>
              {/* User info */}
              <div className="flex items-center gap-3 mb-3 px-1">
                <span className="w-9 h-9 rounded-full bg-[#4f378a] text-white text-xs font-extrabold flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(79,55,138,0.3)]">
                  {getUserInitials(user.name)}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-[#1d1b20] truncate">{user.name}</p>
                  <p className="text-xs text-[#49454f] truncate">{user.email}</p>
                </div>
              </div>
              {/* My Orders */}
              <button
                onClick={() => closeMobileAndNavigate("/orders")}
                className="w-full flex items-center gap-3 px-3 py-2.5 mb-1 rounded-xl text-sm font-semibold text-[#1d1b20] hover:bg-[#f2ecf4] transition-colors border-none bg-transparent cursor-pointer text-left"
              >
                <FiPackage className="w-4 h-4 shrink-0" />
                My Orders
              </button>
              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#ba1a1a] hover:bg-[#ba1a1a]/5 transition-colors cursor-pointer border-none bg-transparent text-left"
              >
                <FiLogOut className="w-4 h-4 shrink-0" />
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="block w-full py-3 bg-[#4f378a] text-white text-sm font-bold rounded-xl text-center hover:bg-[#5f479a] transition-all no-underline shadow-[0_4px_12px_rgba(79,55,138,0.25)]"
            >
              Login / Register
            </Link>
          )}
        </div>
      </div>
    </>
  );
}