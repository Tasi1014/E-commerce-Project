import { FiStar, FiCheckCircle } from "react-icons/fi";

const reviews = [
  {
    name: "Aarav Sharma",
    location: "Kathmandu, Nepal",
    rating: 5,
    title: "Unmatched Fabric Quality & Fit",
    comment: "The linen blazer and wool trousers exceeded my expectations. The tailoring is flawless, and shipping was astonishingly fast!",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop",
    date: "Verified Buyer",
  },
  {
    name: "Sujata Maharjan",
    location: "Lalitpur, Nepal",
    rating: 5,
    title: "Elegant & Minimalist Accessories",
    comment: "I bought the Horizon leather timepiece and gold link bracelet. They feel extremely luxury yet accessible. Will definitely order again!",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop",
    date: "Verified Buyer",
  },
  {
    name: "Prakash Thapa",
    location: "Pokhara, Nepal",
    rating: 5,
    title: "Exceptional Customer Service",
    comment: "Cash on delivery was seamless and the packaging was completely eco-friendly and plastic-free. PEAK sets a new standard!",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=120&auto=format&fit=crop",
    date: "Verified Buyer",
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-8 lg:px-16 bg-[#F5F0EB]">
      <div className="max-w-[1440px] mx-auto">
        
        <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-heading font-extrabold tracking-[0.2em] text-[#4f378a] uppercase block mb-2">
            REAL REVIEWS FROM REAL CUSTOMERS
          </span>
          <h2 className="text-[28px] sm:text-[36px] font-heading font-extrabold text-[#1d1b20]">
            Loved by Style Enthusiasts
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-[#1d1b20]/10 shadow-xs flex flex-col justify-between hover:shadow-lg transition-all duration-300"
            >
              <div>
                {/* Rating stars */}
                <div className="flex items-center gap-1 text-[#f59e0b] mb-4">
                  {[...Array(rev.rating)].map((_, i) => (
                    <FiStar key={i} size={16} className="fill-[#f59e0b]" />
                  ))}
                </div>

                <h3 className="text-base font-heading font-extrabold text-[#1d1b20] mb-2">
                  "{rev.title}"
                </h3>
                
                <p className="text-xs sm:text-sm text-[#49454f] font-normal leading-relaxed mb-6 italic">
                  "{rev.comment}"
                </p>
              </div>

              {/* Author info */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <img
                  src={rev.avatar}
                  alt={rev.name}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-heading font-extrabold text-[#1d1b20]">{rev.name}</p>
                    <FiCheckCircle size={12} className="text-[#34d399]" />
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium">
                    {rev.location} • {rev.date}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
