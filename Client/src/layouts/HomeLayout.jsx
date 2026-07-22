import { Outlet, useLocation } from "react-router-dom";
import HomeHeader from "../Components/Header/HomeHeader";
import HomeFooter from "../Components/Footer/HomeFooter";
import WishlistDrawer from "../Components/UI/WishlistDrawer";
import CartDrawer from "../Components/UI/CartDrawer";
import ProfileDrawer from "../Components/UI/ProfileDrawer";
import BottomNav from "../Components/UI/BottomNav";
import LoginPromptModal from "../Components/UI/LoginPromptModal";  
import { useCart } from "../context/CartContext";  
import { useWishlist } from "../context/WishlistContext";
import { useEffect } from "react";

export default function HomeLayout() {
  const location = useLocation();
  const { showLoginModal, closeLoginModal } = useCart();
  const { showLoginModal: showWishlistLoginModal, closeLoginModal: closeWishlistLoginModal } = useWishlist();

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky Header */}
      <HomeHeader />

      {/* Slide-over Global Wishlist Drawer */}
      <WishlistDrawer />

      {/* Slide-over Global Cart Drawer */}
      <CartDrawer />

      {/* Mobile Profile Sheet/Drawer */}
      <ProfileDrawer />

      {/* Main Content Area – bottom padding on mobile for bottom nav bar clearance */}
      <main className="flex-grow pb-[60px] md:pb-0">
        <Outlet />
      </main>

      {/* Footer */}
      <HomeFooter />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />

      {/* Login Prompt Modal – appears when guest tries to add to cart */}
      <LoginPromptModal isOpen={showLoginModal} onClose={closeLoginModal} />
      {/* Wishlist login modal */}
      <LoginPromptModal isOpen={showWishlistLoginModal} onClose={closeWishlistLoginModal} />
    </div>
  );
}
