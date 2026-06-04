import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FiSearch, FiHeart, FiLogOut, FiUser, FiChevronDown, FiPackage } from "react-icons/fi";
import { BsCart3 } from "react-icons/bs";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

export default function HomeHeader() {
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { wishlist, setIsOpen: openWishlist } = useWishlist();
  const { cart, setIsOpen: openCart } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  const cartCount = cart.length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  const handleLogout = async () => {
    setShowUserMenu(false);
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
    if (trimmed) {
      navigate(`/shop-all?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate("/shop-all");
    }
    setShowSearch(false);
    setSearchQuery("");
  };

  const toggleSearch = () => {
    if (showSearch) setSearchQuery("");
    setShowSearch((prev) => !prev);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#e6e0e9]">
      <div className="max-w-[1440px] mx-auto px-8 flex items-center h-16 gap-10 relative">
        <Link to="/" className="text-[22px] font-extrabold tracking-wide text-[#1d1b20] shrink-0 hover:scale-110 transition-all duration-300">PEAK</Link>

        <div className="flex-1 flex justify-center gap-8">
          {navLinks.map((link) => (
            <NavLink
              to={link.path}
              key={link.label}
              end={link.path === "/"}
              className={({ isActive }) =>
                `text-xs font-semibold tracking-[0.1em] uppercase hover:scale-110 transition-all duration-300 pb-0.5 ${
                  isActive ? "text-[#4f378a] border-b-2 border-[#4f378a]" : "text-[#49454f] hover:text-[#4f378a]"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2 relative">
          <button onClick={toggleSearch} className="p-2 hover:scale-110 transition-all duration-300 bg-transparent border-none cursor-pointer" aria-label="Search">
            <FiSearch size={20} color="#1d1b20" />
          </button>

          <button onClick={() => openWishlist(true)} className="p-2 hover:scale-110 transition-all duration-300 bg-transparent border-none cursor-pointer relative" aria-label="Open Wishlist">
            <FiHeart size={20} color="#1d1b20" />
            {wishlist.length > 0 && (
              <span className="absolute top-0.5 right-0.5 w-[18px] h-[18px] bg-[#4f378a] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white leading-none">
                {wishlist.length > 9 ? "9+" : wishlist.length}
              </span>
            )}
          </button>

          <button onClick={() => openCart(true)} className="p-2 hover:scale-110 transition-all duration-300 bg-transparent border-none cursor-pointer relative" aria-label="Open Cart">
            <BsCart3 size={20} color="#1d1b20" />
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-[18px] h-[18px] bg-[#4f378a] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white leading-none">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>

          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button onClick={() => setShowUserMenu((prev) => !prev)} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#f2ecf4] transition-all duration-300 cursor-pointer border-none bg-transparent" aria-label="User menu">
                <span className="w-8 h-8 rounded-full bg-[#4f378a] text-white text-xs font-extrabold flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(79,55,138,0.3)]">
                  {getUserInitials(user.name)}
                </span>
                <span className="hidden sm:block text-sm font-bold text-[#1d1b20] max-w-[100px] truncate">{user.name?.split(" ")[0]}</span>
                <FiChevronDown className={`w-3.5 h-3.5 text-[#49454f] transition-transform duration-300 ${showUserMenu ? "rotate-180" : "rotate-0"}`} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-[220px] bg-white border border-[#e6e0e9] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.10)] py-2 z-50">
                  <div className="px-4 py-3 border-b border-[#f2ecf4]">
                    <p className="text-sm font-extrabold text-[#1d1b20] truncate">{user.name}</p>
                    <p className="text-xs text-[#49454f] truncate mt-0.5">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link to="/orders" onClick={() => setShowUserMenu(false)} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#1d1b20] hover:bg-[#f2ecf4] transition-colors">
                      <FiPackage className="w-4 h-4" />
                      My Orders
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#ba1a1a] hover:bg-[#ba1a1a]/5 transition-colors cursor-pointer border-none bg-transparent text-left">
                      <FiLogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="px-7 py-3 bg-[#4f378a] text-white text-sm font-bold rounded-xl hover:bg-[#5f479a] transition-all hover:scale-105 duration-300 shadow-[0_10px_30px_rgba(79,55,138,0.3)] no-underline">Login</Link>
          )}

          <div className={`absolute right-55 top-1/2 -translate-y-1/2 transition-all duration-300 origin-right ${showSearch ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}>
            <form onSubmit={handleSearchSubmit}>
              <input ref={searchInputRef} type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search products..." className="w-[240px] px-4 py-2 rounded-xl border border-[#e6e0e9] shadow-sm outline-none text-sm text-[#1d1b20] bg-white focus:border-[#4f378a] transition-all" />
            </form>
          </div>
        </div>
      </div>
    </nav>
  );
}