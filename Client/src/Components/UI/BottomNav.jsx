import { NavLink, useLocation } from "react-router-dom";
import { FiHome, FiShoppingBag, FiHeart, FiUser } from "react-icons/fi";
import { BsCart3 } from "react-icons/bs";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useProfile } from "../../context/ProfileContext";

import { useAuth } from "../../context/AuthContext";

export default function BottomNav() {
  const location = useLocation();
  const { cart, setIsOpen: openCart, isOpen: isCartOpen } = useCart();
  const { wishlist, setIsOpen: openWishlist, isOpen: isWishlistOpen } = useWishlist();
  const { openProfile, isOpen: isProfileOpen } = useProfile();
  const { user } = useAuth();

  const cartCount = cart.length;
  const wishlistCount = wishlist.length;
  const path = location.pathname;

  const getUserInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Active state helpers
  const isHomeActive = path === "/";
  const isShopActive = path === "/shop-all" || path.startsWith("/product/");
  const isCartActive = isCartOpen;
  const isWishlistActive = isWishlistOpen;
  const isProfileActive = isProfileOpen || path === "/orders";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-[#e6e0e9] h-[60px] flex items-center justify-around px-2 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
      {/* 1. Home */}
      <NavLink
        to="/"
        end
        className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer no-underline transition-colors ${
          isHomeActive && !isCartOpen && !isWishlistOpen && !isProfileOpen
            ? "text-[#4f378a]"
            : "text-[#71717a] hover:text-[#4f378a]"
        }`}
      >
        <FiHome size={20} />
        <span className="text-[10px] font-semibold tracking-tight mt-1">Home</span>
      </NavLink>

      {/* 2. Shop */}
      <NavLink
        to="/shop-all"
        className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer no-underline transition-colors ${
          isShopActive && !isCartOpen && !isWishlistOpen && !isProfileOpen
            ? "text-[#4f378a]"
            : "text-[#71717a] hover:text-[#4f378a]"
        }`}
      >
        <FiShoppingBag size={20} />
        <span className="text-[10px] font-semibold tracking-tight mt-1">Shop</span>
      </NavLink>

      {/* 3. Cart */}
      <button
        onClick={() => openCart(true)}
        className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer border-none bg-transparent transition-colors relative ${
          isCartActive ? "text-[#4f378a]" : "text-[#71717a] hover:text-[#4f378a]"
        }`}
        aria-label="Cart"
      >
        <div className="relative">
          <BsCart3 size={20} />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-[#4f378a] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none border border-white">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-semibold tracking-tight mt-1">Cart</span>
      </button>

      {/* 4. Wishlist */}
      <button
        onClick={() => openWishlist(true)}
        className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer border-none bg-transparent transition-colors relative ${
          isWishlistActive ? "text-[#4f378a]" : "text-[#71717a] hover:text-[#4f378a]"
        }`}
        aria-label="Wishlist"
      >
        <div className="relative">
          <FiHeart size={20} />
          {wishlistCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-[#4f378a] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none border border-white">
              {wishlistCount > 9 ? "9+" : wishlistCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-semibold tracking-tight mt-1">Wishlist</span>
      </button>

      {/* 5. Profile */}
      <button
        onClick={openProfile}
        className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer border-none bg-transparent transition-colors ${
          isProfileActive ? "text-[#4f378a]" : "text-[#71717a] hover:text-[#4f378a]"
        }`}
        aria-label="Profile"
      >
        {user ? (
          <span className="w-5 h-5 rounded-full bg-[#4f378a] text-white text-[9px] font-extrabold flex items-center justify-center shrink-0 shadow-2xs">
            {getUserInitials(user.name)}
          </span>
        ) : (
          <FiUser size={20} />
        )}
        <span className="text-[10px] font-semibold tracking-tight mt-1">Profile</span>
      </button>
    </nav>
  );
}
