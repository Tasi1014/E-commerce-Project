const collections = [
  {
    label: "Women",
    img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop",
  },
  {
    label: "Men",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
  },
  {
    label: "Accessories",
    img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop",
  },
];

const products = [
  {
    name: "The Signature Tee",
    price: "$120.00",
    img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Modern Tailored Trouser",
    price: "$240.00",
    img: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Structured Leather Mini",
    price: "$350.00",
    img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Cashmere Blend Knit",
    price: "$195.00",
    img: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=600&auto=format&fit=crop",
  },
];

export default function ProductSection() {
  return (
    <>
      {/* COLLECTIONS */}
      <section className="max-w-1440px mx-auto px-16 py-20">
        <div className="grid grid-cols-3 gap-6">
          {collections.map(({ label, img }) => (
            <div
              key={label}
              className="relative rounded-2xl overflow-hidden h-[420px] cursor-pointer group"
            >
              <img
                src={img}
                alt={label}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.55) 30%, transparent 70%)",
                }}
              />

              <div className="absolute bottom-7 left-6">
                <p className="text-white text-[22px] font-bold mb-2">
                  {label}
                </p>

                <span className="text-white text-[11px] font-bold tracking-[0.12em] uppercase border-b-2 border-[#c9a74d] pb-0.5">
                  Shop Collection
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED ESSENTIALS */}
      <section className="bg-[#f2ecf4] py-20 px-16">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-[36px] font-extrabold">
              Featured Essentials
            </h2>

            <a
              href="#"
              className="text-xs font-bold tracking-[0.1em] uppercase text-[#4f378a] no-underline hover:opacity-70 transition-opacity"
            >
              View All
            </a>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {products.map(({ name, price, img }) => (
              <div
                key={name}
                className="group bg-white rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)] cursor-pointer"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={img}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="flex items-center gap-2 px-6 py-3 bg-[#4f378a] text-white text-sm font-semibold rounded-full border-none">
                      Add to Cart
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-sm font-semibold mb-1">{name}</p>
                  <p className="text-sm text-[#49454f]">{price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}