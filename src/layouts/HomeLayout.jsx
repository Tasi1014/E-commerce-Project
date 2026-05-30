import { Outlet } from "react-router-dom";
import HomeHeader from "../Components/Header/HomeHeader";
import HomeFooter from "../Components/Footer/HomeFooter";

export default function HomeLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky Header */}
      <HomeHeader />

      {/* Main Content Area */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <HomeFooter />
    </div>
  );
}
