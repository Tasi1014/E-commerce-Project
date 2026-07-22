import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import ButtonLink from "../UI/Link";

export default function Hero() {
  const images = [
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1633450797676-8ab93caab915?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1633450750940-4eabe49f4722?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  ];

  return (
    <section className="bg-[#F5F0EB] py-6 sm:py-10 lg:py-12 flex items-center overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 grid grid-cols-2 gap-3 xs:gap-6 sm:gap-10 lg:gap-16 items-center w-full">

        {/* Text Section */}
        <div className="z-10 text-left">
          <h1 className="text-[20px] xs:text-[28px] sm:text-[40px] md:text-[48px] lg:text-[56px] xl:text-[64px] font-extrabold text-black leading-[1.08] mb-3 sm:mb-6 lg:mb-6 tracking-tight">
            Elevate Your <br />
            <span className="text-[#4f378a]">Everyday Style</span>
          </h1>
          <p className="text-[10px] xs:text-xs sm:text-sm md:text-base text-black leading-relaxed mb-4 sm:mb-6 lg:mb-8 max-w-[420px] mx-0">
            Experience curated minimalism with our new collection designed for
            the modern individual. Timeless pieces, modern silhouettes.
          </p>
          <div className="flex flex-wrap gap-2 sm:gap-4 lg:gap-5 justify-start">
            <ButtonLink to="/shop-all" text="Shop now" />
            <ButtonLink to="/shop-all" text="Explore" />
          </div>

          {/* Social proof */}
          <div className="mt-5 sm:mt-8 lg:mt-10 flex items-center gap-2 sm:gap-4 lg:gap-6 justify-start">
            <div className="flex -space-x-2 sm:-space-x-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-6 h-6 xs:w-8 xs:h-8 sm:w-9 sm:h-9 rounded-full border-2 border-[#111111] bg-neutral-800 overflow-hidden"
                >
                  <div className="w-full h-full bg-linear-to-tr opacity-80" />
                </div>
              ))}
            </div>
            <p className="text-[9px] xs:text-xs sm:text-sm text-black">
              <span className="text-black font-medium">2.5k+</span> styles already curated
            </p>
          </div>
        </div>

        {/* Phone Mockup – perfectly scaled for both mobile and desktop viewports */}
        <div className="relative flex justify-center items-center w-full min-w-0">
          {/* Decorative background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160px] xs:w-[240px] sm:w-[350px] lg:w-[450px] h-[160px] xs:h-[240px] sm:h-[350px] lg:h-[450px] bg-[#4f378a]/20 blur-[50px] sm:blur-[100px] rounded-full -z-10 animate-pulse" />

          {/* Phone Frame */}
          <div className="relative w-[150px] h-[300px] xs:w-[180px] xs:h-[360px] sm:w-[220px] sm:h-[440px] md:w-[250px] md:h-[500px] lg:w-[270px] lg:h-[540px] bg-[#111111] rounded-[24px] xs:rounded-[30px] sm:rounded-[40px] lg:rounded-[48px] border-[5px] xs:border-[6px] sm:border-[8px] lg:border-[10px] border-[#222222] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8),0_0_20px_-5px_rgba(79,55,138,0.2)] overflow-hidden transition-all duration-300">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 xs:w-20 sm:w-24 lg:w-28 h-3.5 xs:h-4 sm:h-5 lg:h-6 bg-[#222222] rounded-b-lg xs:rounded-b-xl lg:rounded-b-2xl z-30 flex items-end justify-center pb-0.5 sm:pb-1">
              <div className="w-6 xs:w-7 sm:w-8 h-0.5 sm:h-1 bg-[#333333] rounded-full mb-0.5 sm:mb-1" />
            </div>

            {/* Swiper */}
            <div className="w-full h-full relative z-10">
              <Swiper
                modules={[Autoplay, Pagination, EffectFade]}
                spaceBetween={0}
                slidesPerView={1}
                loop={true}
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                pagination={{ clickable: true, dynamicBullets: true }}
                effect="fade"
                fadeEffect={{ crossFade: true }}
                className="h-full w-full [&_.swiper-pagination-bullet]:bg-white/30 [&_.swiper-pagination-bullet-active]:bg-[#4f378a] [&_.swiper-pagination-bullet-active]:w-6 [&_.swiper-pagination-bullet-active]:rounded-sm [&_.swiper-pagination-bullet]:transition-all [&_.swiper-slide-active_.slide-image]:scale-110 [&_.swiper-slide-active_.slide-content]:translate-y-0 [&_.swiper-slide-active_.slide-content]:opacity-100"
              >
                {images.map((src, index) => (
                  <SwiperSlide key={index}>
                    <div className="relative w-full h-full group overflow-hidden">
                      <img
                        src={src}
                        alt={`Fashion Model ${index + 1}`}
                        className="slide-image absolute inset-0 h-full w-full object-cover object-top transition-transform duration-[6000ms] ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                      <div className="slide-content absolute bottom-4 left-3 right-3 sm:bottom-8 sm:left-5 sm:right-5 z-20 transform translate-y-4 opacity-0 transition-all duration-700 delay-300">
                        <span className="text-[7px] xs:text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-white/60 mb-0.5 sm:mb-1 block">
                          New Arrival
                        </span>
                        <h3 className="text-[9px] xs:text-[11px] sm:text-sm lg:text-base font-bold text-white uppercase tracking-tight leading-tight">
                          Summer 2026 <br /> Collection
                        </h3>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Reflection overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/5 to-transparent z-20" />
          </div>

          {/* Floating badge – only on tablet/desktop */}
          <div className="absolute bottom-6 -right-2 lg:-right-6 bg-[#222222]/85 backdrop-blur-md px-3 py-2.5 rounded-2xl border border-white/10 shadow-2xl z-20 hidden sm:block">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#4f378a] flex items-center justify-center text-white shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <p className="text-[9px] text-white/50 uppercase tracking-wider leading-none mb-1">Verified</p>
                <p className="text-xs font-bold text-white leading-none">Premium Quality</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
