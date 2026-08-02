import { Link } from "react-router-dom";
import { FiCheckCircle, FiArrowRight } from "react-icons/fi";

const stats = [
  { value: "100%", label: "Organic Cotton" },
  { value: "0%", label: "Plastic Packaging" },
  { value: "15k+", label: "Happy Customers" },
];

export default function StorySection() {
  return (
    <section className="py-16 sm:py-24 lg:py-28 px-4 sm:px-8 lg:px-16 bg-white border-y border-[#1d1b20]/10">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

        {/* LEFT COLUMN: EDITORIAL IMAGE WITH OVERLAY BADGE */}
        <div className="lg:col-span-6 relative">
          <div className="rounded-[32px] overflow-hidden aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] shadow-xl border border-gray-100 relative group">
            <img
              src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1000&auto=format&fit=crop"
              alt="Craftsmanship & Detail"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6 text-white text-left">
              <span className="text-[11px] font-bold tracking-widest uppercase bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white/90">
                Ethical Atelier
              </span>
              <p className="text-sm font-serif-editorial italic mt-2 text-white/90">
                "We don't chase fast trends — we craft wardrobe staples meant to endure for seasons to come."
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: BRAND PHILOSOPHY & METRICS */}
        <div className="lg:col-span-6 text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#4f378a]/10 text-[#4f378a] text-xs font-bold tracking-wider uppercase">
            <FiCheckCircle size={14} />
            <span>OUR BRAND PHILOSOPHY</span>
          </div>

          <h2 className="text-[30px] sm:text-[40px] lg:text-[46px] font-heading font-extrabold text-[#1d1b20] leading-tight">
            Quality Without Compromise
          </h2>

          <p className="text-sm sm:text-base text-[#49454f] font-normal leading-relaxed">
            PEAK was founded on the principle that true luxury is defined by material integrity, ethical production, and understated design rather than flashy logos.
          </p>

          <p className="text-sm sm:text-base text-[#49454f] font-normal leading-relaxed">
            Every piece in our collection undergoes rigorous wear-testing, collaborating directly with family-owned mills and master artisans who preserve traditional textile crafts for modern living.
          </p>

          {/* Metric Stats Row */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-b border-gray-100 py-6">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-left">
                <p className="text-2xl sm:text-3xl font-heading font-extrabold text-[#4f378a]">
                  {value}
                </p>
                <p className="text-xs text-[#49454f] font-semibold mt-1">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link
              to="/our-story"
              className="inline-flex items-center gap-2 text-sm font-heading font-bold text-[#1d1b20] hover:text-[#4f378a] border-b-2 border-[#1d1b20] hover:border-[#4f378a] pb-1 transition-colors no-underline"
            >
              <span>Read Our Full Story & Ethics</span>
              <FiArrowRight size={16} />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}