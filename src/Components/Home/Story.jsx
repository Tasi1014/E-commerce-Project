export default function StorySection() {
  return (
    <section className="py-24 px-16">
      <div className="max-w-[1440px] mx-auto grid grid-cols-2 gap-20 items-center">

        {/* Image */}
        <div className="rounded-2xl overflow-hidden h-[480px]">
          <img
            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=800&auto=format&fit=crop"
            alt="Our Story"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
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

          <p className="text-[15px] leading-[1.7] text-[#49454f] mb-5">
            What started as a small vision has evolved into a commitment to
            craftsmanship, where every product is carefully designed, tested,
            and refined to meet the highest standards of durability and elegance.
          </p>

          <p className="text-[15px] leading-[1.7] text-[#49454f] mb-5">
            We collaborate with skilled artisans and family-owned mills who
            have preserved their craft for generations. Each piece reflects a
            balance between tradition and modern design philosophy.
          </p>

          <p className="text-[15px] leading-[1.7] text-[#49454f] mb-8">
            At PEAK, we don’t chase trends — we build essentials that are meant
            to last beyond seasons, creating a wardrobe that feels intentional,
            refined, and personal.
          </p>

          {/* CTA */}
          <a
            href="#"
            className="text-sm font-bold text-[#1d1b20] border-b-2 border-[#1d1b20] pb-0.5 hover:opacity-60 transition-opacity"
          >
            Learn More About Our Ethics
          </a>

          {/* Optional premium footer note */}
          <div className="mt-10 pt-6 border-t border-[#e6e0e9]">
            <p className="text-xs uppercase tracking-[0.2em] text-[#49454f] font-semibold">
              Built for longevity • Designed with intention • Made responsibly
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}