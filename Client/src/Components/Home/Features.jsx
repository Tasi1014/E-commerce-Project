import { FiTruck, FiRefreshCw, FiShield, FiHeadphones } from "react-icons/fi";

const features = [
  {
    title: "Complimentary Shipping",
    desc: "Free express delivery on all orders over $150 worldwide.",
    icon: <FiTruck size={24} className="text-[#4f378a]" />,
    badge: "Fast & Free",
  },
  {
    title: "30-Day Easy Returns",
    desc: "Hassle-free exchanges and full refunds with prepaid labels.",
    icon: <FiRefreshCw size={24} className="text-[#4f378a]" />,
    badge: "Risk-Free",
  },
  {
    title: "Sustainable Craft",
    desc: "Plastic-free packaging & 100% GOTS certified organic materials.",
    icon: <FiShield size={24} className="text-[#4f378a]" />,
    badge: "Eco-Friendly",
  },
  {
    title: "Dedicated Styling 24/7",
    desc: "Personalized assistance & order tracking anytime you need.",
    icon: <FiHeadphones size={24} className="text-[#4f378a]" />,
    badge: "24/7 Support",
  },
];

export default function Features() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-8 lg:px-16 bg-[#F5F0EB]">
      <div className="max-w-[1440px] mx-auto">
        <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-heading font-extrabold tracking-[0.2em] text-[#4f378a] uppercase block mb-2">
            THE PEAK PROMISE
          </span>
          <h2 className="text-[26px] sm:text-[34px] font-heading font-extrabold text-[#1d1b20]">
            Crafted for Excellence & Peace of Mind
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map(({ title, desc, icon, badge }) => (
            <div
              key={title}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-[#1d1b20]/10 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#4f378a]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {icon}
                  </div>
                  <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#4f378a] bg-[#4f378a]/8 px-2.5 py-1 rounded-full">
                    {badge}
                  </span>
                </div>
                <h3 className="text-lg font-heading font-extrabold text-[#1d1b20] mb-2.5">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-[#49454f] font-normal leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}