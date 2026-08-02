import { useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { FiArrowRight, FiCheckCircle, FiStar, FiShoppingBag, FiAward } from "react-icons/fi";
import { BsStars } from "react-icons/bs";

export default function Hero() {
  const images = [
    {
      src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop",
      tag: "Summer Collection",
      title: "Monochrome Linen Blazer",
      price: "$280.00",
    },
    {
      src: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000&auto=format&fit=crop",
      tag: "Trending Now",
      title: "Silk Minimalist Trench",
      price: "$340.00",
    },
    {
      src: "https://images.unsplash.com/photo-1633450797676-8ab93caab915?q=80&w=1000&auto=format&fit=crop",
      tag: "Handcrafted",
      title: "Gold Link Bracelet",
      price: "$299.00",
    },
    {
      src: "https://images.unsplash.com/photo-1633450750940-4eabe49f4722?q=80&w=1000&auto=format&fit=crop",
      tag: "Essential",
      title: "Horizon Leather Timepiece",
      price: "$210.00",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F5F0EB] via-[#f8f4ef] to-[#F5F0EB]">
      {/* ── TOP ANNOUNCEMENT TICKER MARQUEE ───────────────────────── */}
      <div className="bg-[#261546] text-white py-2.5 overflow-hidden text-[11px] font-semibold tracking-wider uppercase border-b border-white/10 shadow-xs">
        <div className="animate-marquee whitespace-nowrap flex items-center justify-around gap-8">
          <span className="flex items-center gap-2 text-white/90">
            <BsStars className="text-[#c8b7ff]" size={13} /> COMPLIMENTARY EXPRESS SHIPPING ON ORDERS OVER $150
          </span>
          <span className="text-[#c8b7ff]">•</span>
          <span className="flex items-center gap-2 text-white/90">
            DISCOVER THE NEW SUMMER 2026 COLLECTION
          </span>
          <span className="text-[#c8b7ff]">•</span>
          <span className="flex items-center gap-2 text-white/90">
            SUSTAINABLE MINIMALISM & ETHICAL CRAFTSMANSHIP
          </span>
          <span className="text-[#c8b7ff]">•</span>
          <span className="flex items-center gap-2 text-white/90">
            <BsStars className="text-[#c8b7ff]" size={13} /> GET 10% OFF YOUR FIRST ORDER WITH CODE: PEAK10
          </span>
          <span className="text-[#c8b7ff]">•</span>
          {/* Duplicate set for smooth infinite marquee loop */}
          <span className="flex items-center gap-2 text-white/90">
            <BsStars className="text-[#c8b7ff]" size={13} /> COMPLIMENTARY EXPRESS SHIPPING ON ORDERS OVER $150
          </span>
          <span className="text-[#c8b7ff]">•</span>
          <span className="flex items-center gap-2 text-white/90">
            DISCOVER THE NEW SUMMER 2026 COLLECTION
          </span>
          <span className="text-[#c8b7ff]">•</span>
          <span className="flex items-center gap-2 text-white/90">
            SUSTAINABLE MINIMALISM & ETHICAL CRAFTSMANSHIP
          </span>
        </div>
      </div>

      {/* ── HERO CONTAINER ────────────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* LEFT: EDITORIAL TYPOGRAPHY & CALL TO ACTION */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-7 z-10 text-left">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#4f378a]/10 border border-[#4f378a]/20 text-[#4f378a] text-xs font-bold tracking-wider uppercase shadow-2xs">
              <BsStars className="text-[#4f378a] animate-pulse" size={13} />
              <span>Summer Collection 2026</span>
            </div>

            {/* Main Headline with Serif Accent */}
            <h1 className="text-[34px] xs:text-[42px] sm:text-[56px] md:text-[64px] lg:text-[68px] font-heading font-extrabold text-[#1d1b20] leading-[1.05] tracking-tight">
              Elevate Your <br className="hidden xs:inline" />
              <span className="font-serif-editorial italic font-normal text-[#4f378a] block sm:inline sm:ml-2">
                Everyday Style
              </span>
            </h1>

            {/* Editorial Description */}
            <p className="text-sm sm:text-base md:text-lg text-[#49454f] leading-relaxed max-w-xl font-normal">
              Experience curated luxury & sustainable minimalism. Designed for the modern individual who values timeless silhouettes, material integrity, and effortless elegance.
            </p>

            {/* Primary & Secondary Call to Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                to="/shop-all"
                className="px-7 py-3.5 sm:px-8 sm:py-4 bg-[#4f378a] hover:bg-[#3d2a6e] text-white font-heading font-bold text-sm sm:text-base rounded-full shadow-[0_10px_30px_rgba(79,55,138,0.3)] hover:shadow-[0_14px_36px_rgba(79,55,138,0.4)] transition-all duration-300 flex items-center gap-2.5 group cursor-pointer no-underline"
              >
                <FiShoppingBag size={18} />
                <span>Shop Collection</span>
                <FiArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/shop-all?category=Accessories"
                className="px-6 py-3.5 sm:px-7 sm:py-4 bg-white/80 hover:bg-white border border-[#1d1b20]/15 hover:border-[#4f378a] text-[#1d1b20] hover:text-[#4f378a] font-heading font-bold text-sm sm:text-base rounded-full backdrop-blur-md transition-all duration-300 shadow-xs cursor-pointer no-underline"
              >
                Explore Accessories
              </Link>
            </div>

            {/* Social Proof & Rating Badge */}
            <div className="pt-4 border-t border-[#1d1b20]/10 flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="flex items-center -space-x-2.5">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop"
                  alt="Customer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white object-cover shadow-xs"
                />
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop"
                  alt="Customer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white object-cover shadow-xs"
                />
                <img
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=120&auto=format&fit=crop"
                  alt="Customer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white object-cover shadow-xs"
                />
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#4f378a] border-2 border-white text-white font-bold text-[11px] flex items-center justify-center shadow-xs">
                  2.5k+
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1 text-[#f59e0b] mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} size={14} className="fill-[#f59e0b]" />
                  ))}
                  <span className="text-xs font-bold text-[#1d1b20] ml-1">4.9 / 5.0</span>
                </div>
                <p className="text-xs text-[#49454f] font-medium">
                  Curated & loved by style enthusiasts worldwide
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: FEATURED EDITORIAL SLIDER WITH GLASS BADGES */}
          <div className="lg:col-span-5 relative flex justify-center items-center mt-4 lg:mt-0">
            
            {/* Background Glow Sphere */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[420px] lg:w-[480px] h-[280px] sm:h-[420px] lg:h-[480px] bg-[#4f378a]/15 blur-[90px] rounded-full -z-10 animate-pulse" />

            {/* Main Image Slider Frame */}
            <div className="relative w-full max-w-[360px] sm:max-w-[420px] lg:max-w-[440px] aspect-[4/5] rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] border-4 border-white/80 bg-white">
              
              <Swiper
                modules={[Autoplay, Pagination, EffectFade]}
                spaceBetween={0}
                slidesPerView={1}
                loop={true}
                autoplay={{ delay: 4500, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                effect="fade"
                fadeEffect={{ crossFade: true }}
                onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                className="h-full w-full [&_.swiper-pagination-bullet]:bg-white/60 [&_.swiper-pagination-bullet-active]:bg-[#4f378a] [&_.swiper-pagination-bullet-active]:w-6 [&_.swiper-pagination-bullet-active]:rounded-full [&_.swiper-pagination-bullet]:transition-all"
              >
                {images.map((item, idx) => (
                  <SwiperSlide key={idx}>
                    <div className="relative w-full h-full group overflow-hidden">
                      <img
                        src={item.src}
                        alt={item.title}
                        className="w-full h-full object-cover object-top transition-transform duration-[6000ms] ease-out group-hover:scale-105"
                      />
                      {/* Gradient Shadow Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/10" />

                      {/* Content Overlay */}
                      <div className="absolute bottom-6 left-6 right-6 text-left z-20">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-md text-[#c8b7ff] text-[10px] font-extrabold uppercase tracking-widest mb-1.5">
                          {item.tag}
                        </span>
                        <h3 className="text-xl font-heading font-extrabold text-white leading-tight">
                          {item.title}
                        </h3>
                        <p className="text-sm font-semibold text-white/80 mt-0.5">
                          {item.price}
                        </p>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Floating Glassmorphic Quality Badge */}
            <div className="absolute -bottom-4 -left-2 sm:left-4 lg:-left-6 bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/60 shadow-xl z-30 animate-float-slow hidden sm:flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#4f378a] text-white flex items-center justify-center shrink-0 shadow-sm">
                <FiCheckCircle size={18} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">
                  100% Certified
                </p>
                <p className="text-xs font-heading font-extrabold text-[#1d1b20] leading-none">
                  Ethical & Sustainable
                </p>
              </div>
            </div>

            {/* Floating Live Product Tag Pill */}
            <div className="absolute top-6 -right-2 sm:right-4 lg:-right-6 bg-[#1d1b20]/90 text-white backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shadow-xl z-30 hidden sm:flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#34d399] animate-ping" />
              <div className="text-left">
                <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wide leading-none mb-1">
                  Featured Piece
                </p>
                <p className="text-xs font-bold text-white leading-none">
                  {images[activeIndex]?.title}
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
