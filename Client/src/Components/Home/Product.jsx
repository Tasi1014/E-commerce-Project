import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import SingleProductItem from "../Product/SingleProductGridItem";
import { useCart } from "../../context/CartContext";
import { fetchProducts } from "../../api/productApi";

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

export default function ProductSection() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getFeatured = async () => {
      try {
        setLoading(true);
        const res = await fetchProducts({ limit: 4 });
        if (res.data.success) {
          setFeaturedProducts(res.data.products);
        }
      } catch (err) {
        console.error("Error fetching featured products:", err);
      } finally {
        setLoading(false);
      }
    };
    getFeatured();
  }, []);

  return (
    <>
      {/* COLLECTIONS */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {collections.map(({ label, img }) => (
            <div
              key={label}
              onClick={() => navigate(`/shop-all?category=${label}`)}
              className="relative rounded-2xl overflow-hidden h-[260px] sm:h-[340px] lg:h-[420px] cursor-pointer group"
            >
              <img
                src={img}
                alt={label}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(to top, rgba(0,0,0,0.55) 30%, transparent 70%)",
                }}
              />
              <div className="absolute bottom-5 sm:bottom-7 left-5 sm:left-6">
                <p className="text-white text-[18px] sm:text-[22px] font-bold mb-1.5 sm:mb-2">
                  {label}
                </p>
                <span className="text-white text-[10px] sm:text-[11px] font-bold tracking-[0.12em] uppercase border-b-2 border-[#c9a74d] pb-0.5">
                  Shop Collection
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED ESSENTIALS */}
      <section className="bg-[#f2ecf4] py-12 sm:py-16 lg:py-20 px-4 sm:px-8 lg:px-16">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex justify-between items-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-[26px] sm:text-[32px] lg:text-[36px] font-extrabold">
              Featured Essentials
            </h2>
            <Link
              to="shop-all"
              className="text-xs font-bold tracking-[0.1em] uppercase text-[#4f378a] no-underline hover:opacity-70 transition-opacity"
            >
              View All
            </Link>
          </div>

          {/* Product grid: 2 cols on mobile, 4 on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {loading ? (
              <div className="col-span-2 lg:col-span-4 text-center py-12 text-sm font-semibold text-[#49454f]">
                Loading essentials...
              </div>
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <SingleProductItem
                  key={product._id}
                  name={product.name}
                  price={`$${product.price.toFixed(2)}`}
                  img={product.mainImage}
                  onClick={() => navigate(`/product/${product._id}`)}
                  onAddToCart={() => {
                    addToCart(
                      {
                        id: product._id,
                        name: product.name,
                        price: product.price,
                        image: product.mainImage,
                      },
                      null,
                      "",
                      1
                    );
                  }}
                />
              ))
            ) : (
              <div className="col-span-2 lg:col-span-4 text-center py-12 text-sm font-semibold text-[#49454f]">
                No featured essentials found.
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}