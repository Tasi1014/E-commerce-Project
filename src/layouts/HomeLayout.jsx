import { Outlet } from "react-router-dom";
import HomeHeader from "../Components/Header/HomeHeader";
import HomeFooter from "../Components/Footer/HomeFooter";
import WishlistDrawer from "../Components/UI/WishlistDrawer";
import CartDrawer from "../Components/UI/CartDrawer";
import LoginPromptModal from "../Components/UI/LoginPromptModal";  
import { useCart } from "../context/CartContext";  
import { useWishlist } from "../context/WishlistContext";

export default function HomeLayout() {
  const { showLoginModal, closeLoginModal } = useCart();
  const { showLoginModal: showWishlistLoginModal, closeLoginModal: closeWishlistLoginModal } = useWishlist();
  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky Header */}
      <HomeHeader />

      {/* Slide-over Global Wishlist Drawer */}
      <WishlistDrawer />

      {/* Slide-over Global Cart Drawer */}
      <CartDrawer />

      {/* Main Content Area */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <HomeFooter />

      {/* Login Prompt Modal – appears when guest tries to add to cart */}
      <LoginPromptModal isOpen={showLoginModal} onClose={closeLoginModal} />
      {/* Wishlist login modal */}
      <LoginPromptModal isOpen={showWishlistLoginModal} onClose={closeWishlistLoginModal} />
    </div>
  );
}

