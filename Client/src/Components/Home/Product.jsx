import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import SingleProductItem from "../Product/SingleProductGridItem";
import { useCart } from "../../context/CartContext";
import { fetchProducts } from "../../api/productApi";
import { FiArrowRight, FiCheck } from "react-icons/fi";
import { BsStars } from "react-icons/bs";

const collections = [
  {
    label: "Women",
    subtitle: "Modern Silhouettes",
    count: "42+ Styles",
    img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop",
  },
  {
    label: "Men",
    subtitle: "Refined Tailoring",
    count: "38+ Styles",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
  },
  {
    label: "Accessories",
    subtitle: "Timeless Essentials",
    count: "25+ Styles",
    img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop",
  },
];

const categoryTabs = ["All Essentials", "Women", "Men", "Accessories"];

export default function ProductSection() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All Essentials");

  useEffect(() => {
    const getFeatured = async () => {
      try {
        setLoading(true);
        const params = { limit: 8 };
        if (activeTab !== "All Essentials") {
          params.category = activeTab;
        }
        const res = await fetchProducts(params);
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
  }, [activeTab]);

  return (
    <>
      {/* ── 1. FEATURED CATEGORY COLLECTIONS ─────────────────────────── */}
      <section className="py-14 sm:py-20 lg:py-24 max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-heading font-extrabold tracking-[0.2em] text-[#4f378a] uppercase block mb-2">
            CURATED COLLECTIONS
          </span>
          <h2 className="text-[28px] sm:text-[38px] md:text-[44px] font-heading font-extrabold text-[#1d1b20] leading-tight">
            Designed for Every Occasion
          </h2>
          <p className="text-sm sm:text-base text-[#49454f] mt-3 font-normal leading-relaxed">
            Explore our thoughtfully structured categories, crafted with premium sustainable fabrics and timeless aesthetics.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {collections.map(({ label, subtitle, count, img }) => (
            <div
              key={label}
              onClick={() => navigate(`/shop-all?category=${label}`)}
              className="relative rounded-3xl overflow-hidden h-[340px] sm:h-[400px] lg:h-[460px] cursor-pointer group shadow-md hover:shadow-2xl transition-all duration-500 bg-black"
            >
              <img
                src={img}
                alt={label}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108 opacity-90 group-hover:opacity-100"
              />

              {/* Gradient Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent transition-opacity duration-300" />

              {/* Glass Pill Count Badge */}
              <div className="absolute top-5 right-5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 text-white text-[11px] font-bold">
                {count}
              </div>

              {/* Bottom Card Labels */}
              <div className="absolute bottom-6 left-6 right-6 text-left transform group-hover:-translate-y-1 transition-transform duration-300">
                <span className="text-xs font-semibold text-[#c8b7ff] uppercase tracking-wider block mb-1">
                  {subtitle}
                </span>
                <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-white mb-3">
                  {label}
                </h3>
                
                <div className="inline-flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider group-hover:text-[#c8b7ff] transition-colors">
                  <span>Shop Collection</span>
                  <FiArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 2. FEATURED ESSENTIALS GRID WITH CATEGORY TABS ─────────── */}
      <section className="bg-[#ede5dc]/60 py-16 sm:py-20 lg:py-24 px-4 sm:px-8 lg:px-16 border-y border-[#1d1b20]/10">
        <div className="max-w-[1440px] mx-auto">
          
          {/* Header & Category Filter Tabs */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 sm:mb-14">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-[#4f378a] uppercase mb-2">
                <BsStars size={14} />
                <span>HANDPICKED FOR YOU</span>
              </div>
              <h2 className="text-[28px] sm:text-[36px] lg:text-[42px] font-heading font-extrabold text-[#1d1b20]">
                Featured Essentials
              </h2>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {categoryTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 border cursor-pointer ${
                    activeTab === tab
                      ? "bg-[#4f378a] text-white border-[#4f378a] shadow-md"
                      : "bg-white/80 text-[#49454f] border-gray-200 hover:bg-white hover:border-[#4f378a]/50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded-md w-3/4" />
                    <div className="h-4 bg-gray-200 rounded-md w-1/3" />
                  </div>
                </div>
              ))
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
              <div className="col-span-2 md:col-span-3 lg:col-span-4 text-center py-16 bg-white/50 rounded-3xl border border-dashed">
                <p className="text-base text-[#49454f] font-semibold">
                  No products found in this category.
                </p>
              </div>
            )}
          </div>

          {/* Bottom View All Link Button */}
          <div className="mt-12 text-center">
            <Link
              to="/shop-all"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-white border border-[#1d1b20]/20 hover:border-[#4f378a] text-[#1d1b20] hover:text-[#4f378a] font-heading font-bold text-sm rounded-full shadow-sm hover:shadow-md transition-all duration-300 no-underline cursor-pointer"
            >
              <span>Explore Entire Catalog</span>
              <FiArrowRight size={16} />
            </Link>
          </div>

        </div>
      </section>
    </>
  );
}