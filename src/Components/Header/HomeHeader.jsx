import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { BsCart3 } from "react-icons/bs";

export default function HomeHeader() {
  const [showSearch, setShowSearch] = useState(false);

  const navLinks = [
    { label: "Collections", path: "/" },
    { label: "New Arrivals", path: "/new-arrivals" },
    { label: "Shop All", path: "/shop-all" },
    { label: "Our Story", path: "/story" },
    { label: "Contact Us", path: "/contact-us" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#e6e0e9]">
      <div className="max-w-1440px mx-auto px-8 flex items-center h-16 gap-10 relative">

        {/* Logo */}
        <Link
          to="/"
          className="text-[22px] font-extrabold tracking-wide text-[#1d1b20] shrink-0 hover:scale-110 transition-all duration-300"
        >
          PEAK
        </Link>

        {/* Center Nav */}
        <div className="flex-1 flex justify-center gap-8">
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

        {/* Icons */}
        <div className="flex items-center gap-2 relative">

          {/* Search Button */}
          <button
            onClick={() => setShowSearch((prev) => !prev)}
            className="p-2 hover:scale-110 transition-all duration-300 bg-transparent border-none cursor-pointer"
          >
            <FiSearch size={20} color="#1d1b20" />
          </button>

          {/* Cart */}
          <button className="p-2 hover:scale-110 transition-all duration-300 bg-transparent border-none cursor-pointer">
            <BsCart3 size={20} color="#1d1b20" />
          </button>

          {/* Login */}
          <Link
            to="/login"
            className="px-7 py-3 bg-[#4f378a] text-white text-sm font-bold rounded-xl hover:bg-[#5f479a] transition-all hover:scale-105 duration-300 shadow-[0_10px_30px_rgba(79,55,138,0.3)]"
          >
            Login
          </Link>

          {/* SEARCH INPUT (animated) */}
          <div
            className={`absolute right-45 top-1/2 -translate-y-1/2 transition-all duration-300 origin-right ${
              showSearch
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
          >
            <input
              type="text"
              placeholder="Search products..."
              className="w-[240px] px-4 py-2 rounded-xl border border-[#e6e0e9] shadow-sm outline-none text-sm text-[#1d1b20] bg-white focus:border-[#4f378a] transition-all"
              autoFocus
            />
          </div>
        </div>
      </div>
    </nav>
  );
}