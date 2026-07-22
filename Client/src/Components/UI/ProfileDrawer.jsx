import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiX, FiPackage, FiBookOpen, FiMail, FiGrid, FiLogOut, FiUser } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";
import { toast } from "sonner";

export default function ProfileDrawer() {
  const { isOpen, closeProfile } = useProfile();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleLogout = async () => {
    closeProfile();
    await logout();
    toast.success("Logged out successfully.");
    navigate("/");
  };

  const getUserInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleLinkClick = (path) => {
    closeProfile();
    navigate(path);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeProfile}
        className={`fixed inset-0 bg-black/40 backdrop-blur-xs z-[80] transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Slide-Up Bottom Sheet for Mobile */}
      <div
        className={`fixed left-0 right-0 bottom-0 max-h-[85vh] bg-white rounded-t-3xl z-[90] shadow-2xl flex flex-col transition-transform duration-300 ease-out md:hidden border-t border-gray-100 ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Drag handle */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto my-3 shrink-0" />

        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {user ? (
              <span className="w-11 h-11 rounded-full bg-[#4f378a] text-white text-sm font-extrabold flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(79,55,138,0.3)]">
                {getUserInitials(user.name)}
              </span>
            ) : (
              <div className="w-11 h-11 rounded-full bg-[#f2ecf4] text-[#4f378a] flex items-center justify-center shrink-0">
                <FiUser size={22} />
              </div>
            )}

            <div className="min-w-0">
              {user ? (
                <>
                  <h3 className="text-base font-extrabold text-[#1d1b20] truncate">{user.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </>
              ) : (
                <>
                  <h3 className="text-base font-extrabold text-[#1d1b20]">Welcome to PEAK</h3>
                  <p className="text-xs text-gray-500">Sign in to manage orders & details</p>
                </>
              )}
            </div>
          </div>

          <button
            onClick={closeProfile}
            className="p-2 rounded-full bg-[#f2ecf4] text-[#1d1b20] hover:bg-[#e9ddff] transition-all cursor-pointer border-none flex items-center justify-center"
            aria-label="Close Profile"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Content & Links */}
        <div className="overflow-y-auto p-4 space-y-1">
          {!user && (
            <div className="p-3 mb-2 bg-[#f8f5fd] rounded-2xl border border-[#4f378a]/10 text-center">
              <button
                onClick={() => handleLinkClick("/login")}
                className="w-full py-3 bg-[#4f378a] text-white font-bold text-sm rounded-xl hover:bg-[#5f479a] transition border-none cursor-pointer shadow-sm"
              >
                Login / Register
              </button>
            </div>
          )}

          <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 px-3 py-1">
            Account & Support
          </p>

          {user && (
            <button
              onClick={() => handleLinkClick("/orders")}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold text-[#1d1b20] hover:bg-[#f2ecf4] transition-colors border-none bg-transparent cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-[#f2ecf4] text-[#4f378a] flex items-center justify-center">
                <FiPackage size={16} />
              </div>
              My Orders
            </button>
          )}

          <button
            onClick={() => handleLinkClick("/story")}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold text-[#1d1b20] hover:bg-[#f2ecf4] transition-colors border-none bg-transparent cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-[#f2ecf4] text-[#4f378a] flex items-center justify-center">
              <FiBookOpen size={16} />
            </div>
            Our Story
          </button>

          <button
            onClick={() => handleLinkClick("/contact-us")}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold text-[#1d1b20] hover:bg-[#f2ecf4] transition-colors border-none bg-transparent cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-[#f2ecf4] text-[#4f378a] flex items-center justify-center">
              <FiMail size={16} />
            </div>
            Contact Us
          </button>

          {user?.role === "admin" && (
            <button
              onClick={() => handleLinkClick("/admin/dashboard")}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold text-[#4f378a] bg-[#f2ecf4]/60 hover:bg-[#f2ecf4] transition-colors border-none cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-[#4f378a] text-white flex items-center justify-center">
                <FiGrid size={16} />
              </div>
              Admin Panel
            </button>
          )}

          {user && (
            <div className="pt-2 border-t border-gray-100 mt-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold text-[#ba1a1a] hover:bg-[#ba1a1a]/5 transition-colors border-none bg-transparent cursor-pointer text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-[#ba1a1a]/10 text-[#ba1a1a] flex items-center justify-center">
                  <FiLogOut size={16} />
                </div>
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Bottom padding for safety */}
        <div className="h-6" />
      </div>
    </>
  );
}
