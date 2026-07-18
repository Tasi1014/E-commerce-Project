import { FaTruck, FaLeaf, FaHeadset } from "react-icons/fa";

const features = [
  {
    title: "Free Shipping",
    desc: "Complimentary delivery on all orders over $150.",
    icon: <FaTruck size={28} className="text-[#4f378a]" />,
  },
  {
    title: "Eco-Friendly",
    desc: "Plastic-free packaging and carbon-neutral shipping.",
    icon: <FaLeaf size={28} className="text-[#4f378a]" />,
  },
  {
    title: "24/7 Support",
    desc: "Dedicated assistance for all your style needs.",
    icon: <FaHeadset size={28} className="text-[#4f378a]" />,
  },
];

export default function Features() {
  return (
    <section className="bg-[#f2ecf4] py-12 sm:py-16 lg:py-20 px-4 sm:px-8 lg:px-16">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 text-center">
        {features.map(({ title, desc, icon }) => (
          <div key={title}>
            <div className="w-16 h-16 rounded-full bg-[#e9ddff] flex items-center justify-center mx-auto mb-5">
              {icon}
            </div>
            <h3 className="text-lg font-bold mb-2.5">{title}</h3>
            <p className="text-sm text-[#49454f] leading-[1.6]">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}