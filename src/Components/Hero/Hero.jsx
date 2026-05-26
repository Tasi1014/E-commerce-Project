import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

export default function Hero() {
  const images = [
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1633450797676-8ab93caab915?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1633450750940-4eabe49f4722?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  ];

  return (
    <section className="bg-[#111111] min-h-screen flex items-center overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-16 py-20 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center w-full">
        {/* Text Section */}
        <div className="z-10">
          <h1 className="text-[64px] lg:text-[72px] font-extrabold text-white leading-[1.05] mb-8 tracking-tight">
            Elevate Your <br />
            <span className="text-[#4f378a]">Everyday Style</span>
          </h1>
          <p className="text-lg text-white/60 leading-relaxed mb-10 max-w-[420px]">
            Experience curated minimalism with our new collection designed for
            the modern individual. Timeless pieces, modern silhouettes.
          </p>
          <div className="flex flex-wrap gap-5">
            <button className="px-10 py-4 bg-[#4f378a] text-white text-sm font-bold rounded-xl cursor-pointer border-none hover:bg-[#5f479a] transition-all hover:scale-105 duration-300 shadow-[0_10px_30px_rgba(79,55,138,0.3)]">
              Shop Now
            </button>
            <button className="px-10 py-4 bg-white/5 text-white text-sm font-bold rounded-xl cursor-pointer border border-white/10 hover:bg-white/10 transition-all hover:scale-105 duration-300 backdrop-blur-sm">
              Explore Collection
            </button>
          </div>

          <div className="mt-16 flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-[#111111] bg-neutral-800 overflow-hidden"
                >
                  <div className="w-full h-full bg-linear-to-tr from-[#4f378a] to-pink-500/50 opacity-80" />
                </div>
              ))}
            </div>
            <p className="text-sm text-white/40">
              <span className="text-white font-medium">2.5k+</span> styles
              already curated
            </p>
          </div>
        </div>

        {/* Swiper / Phone Mockup Section */}
        <div className="relative flex justify-center items-center w-full min-w-0">
          {/* Decorative background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#4f378a]/20 blur-[120px] rounded-full -z-10 animate-pulse"></div>

          {/* Static Phone Mockup Frame */}
          <div className="relative w-[300px] h-[600px] bg-[#111111] rounded-[50px] border-[10px] border-[#222222] shadow-[0_60px_120px_-30px_rgba(0,0,0,0.9),0_0_50px_-10px_rgba(79,55,138,0.2)] overflow-hidden lg:-translate-y-12 transition-transform duration-500">
            {/* Phone Notch/Speaker */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-[#222222] rounded-b-2xl z-30 flex items-end justify-center pb-1">
              <div className="w-10 h-1 bg-[#333333] rounded-full mb-1"></div>
            </div>

            {/* Inner Content (Swiper) */}
            <div className="w-full h-full relative z-10">
              <Swiper
                modules={[Autoplay, Pagination, EffectFade]}
                spaceBetween={0}
                slidesPerView={1}
                loop={true}
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                }}
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
                      {/* Gradient overlay for text legibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>

                      {/* Slide Content */}
                      <div className="slide-content absolute bottom-12 left-6 right-6 z-20 transform translate-y-4 opacity-0 transition-all duration-700 delay-300">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-white/60 mb-1 block">
                          New Arrival
                        </span>
                        <h3 className="text-lg font-bold text-white uppercase tracking-tight leading-tight">
                          Summer '26 <br /> Collection
                        </h3>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Glass effect reflection overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/5 to-transparent z-20"></div>
          </div>
          {/* Floating badge */}
          <div className="absolute bottom-8 -right-4 lg:-right-12 bg-[#222222]/85 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shadow-2xl z-20 hidden sm:block">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#4f378a] flex items-center justify-center text-white shrink-0">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>

              <div>
                <p className="text-[10px] text-white/50 uppercase tracking-wider leading-none mb-1">
                  Verified
                </p>
                <p className="text-xs font-bold text-white leading-none">
                  Premium Quality
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
