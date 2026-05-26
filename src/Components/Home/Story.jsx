export default function StorySection() {
  return (
    <section className="py-24 px-16">
      <div className="max-w-[1440px] mx-auto grid grid-cols-2 gap-20 items-center">
        <div className="rounded-2xl overflow-hidden h-[480px]">
          <img
            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=800&auto=format&fit=crop"
            alt="Our Story"
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <p className="text-xs font-bold tracking-[0.15em] uppercase text-[#4f378a] mb-4">
            Our Story
          </p>

          <h2 className="text-[40px] font-extrabold leading-[1.2] mb-6">
            Quality without compromise.
          </h2>

          <p className="text-[15px] leading-[1.7] text-[#49454f] mb-5">
            PEAK was founded on the belief that luxury should be defined by
            material integrity and timeless design rather than logos.
          </p>

          <p className="text-[15px] leading-[1.7] text-[#49454f] mb-8">
            We source only the finest natural fibers and work with family-owned
            mills.
          </p>

          <a
            href="#"
            className="text-sm font-bold text-[#1d1b20] border-b-2 border-[#1d1b20] pb-0.5 hover:opacity-60 transition-opacity"
          >
            Learn More About Our Ethics
          </a>
        </div>
      </div>
    </section>
  );
}