import { Link } from "react-router-dom";
import HomeHeader from "../Components/Header/HomeHeader";
import HomeFooter from "../Components/Footer/HomeFooter";

export default function NotFound() {
  return (
    <>
    <HomeHeader/>
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-20">
      <div className="max-w-2xl text-center">
        {/* Elegant 404 mark – minimal, no ornament */}
        <div className="mb-10">
          <span className="text-[120px] md:text-[160px] font-light text-[#4f378a] tracking-tighter leading-none">
            404
          </span>
        </div>

        {/* Editorial headline – refined, understated */}
        <h1 className="text-2xl md:text-3xl font-light text-[#1c1b1f] mb-4 tracking-tight">
          Page not found
        </h1>

        {/* Calm, quality‑focused explanation */}
        <p className="text-[#49454f] text-[15px] leading-relaxed max-w-md mx-auto mb-10">
          The page you’re looking for doesn’t exist or has been moved.<br />
          Let’s return you to something timeless.
        </p>

        {/* Two subtle CTAs – one solid, one outline (both restrained) */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          
          <Link
            to="/collections"
            className="px-8 py-3 border border-[#4f378a] text-[#4f378a] text-sm font-medium uppercase tracking-wide hover:bg-[#4f378a] hover:text-white transition-all duration-200"
          >
            Explore Collections
          </Link>
        </div>

        {/* Brand philosophy footer – matches the “quality without compromise” tone */}
        <p className="text-[11px] text-[#a9a5ad] tracking-[0.2em] uppercase mt-12">
          PEAK — timeless design, material integrity
        </p>
      </div>
    </div>
    <HomeFooter/>
    </>
  );
}