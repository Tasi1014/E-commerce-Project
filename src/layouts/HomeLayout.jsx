import { Outlet } from "react-router-dom";
import HomeHeader from "../Components/Header/HomeHeader";
import HomeFooter from "../Components/Footer/HomeFooter";
import WishlistDrawer from "../Components/UI/WishlistDrawer";

export default function HomeLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky Header */}
      <HomeHeader />

      {/* Slide-over Global Wishlist Drawer */}
      <WishlistDrawer />

      {/* Main Content Area */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <HomeFooter />
    </div>
  );
}
