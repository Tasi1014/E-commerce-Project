import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FiChevronDown, FiChevronUp, FiHeart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa"; // solid heart for active wishlist
import SingleProductItem from "../Components/Product/SingleProductGridItem";
import { MOCK_PRODUCTS } from "../data/products";
import { useWishlist } from "../context/WishlistContext";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Wire dynamic global Wishlist state
  const { isWishlisted, toggleWishlist } = useWishlist();

  // Find product dynamically by ID
  const product = useMemo(() => {
    return MOCK_PRODUCTS.find((p) => p.id === parseInt(id)) || null;
  }, [id]);

  const isProductInWishlist = isWishlisted(product ? product.id : null);

  // States
  const [activeImg, setActiveImg] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");

  // Accordion open/close states
  const [accordionOpen, setAccordionOpen] = useState({
    details: true,
    shipping: false,
    sustainability: false,
  });

  // Scroll to top on page load or product ID change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  // Synchronize product-dependent default states when product changes
  useEffect(() => {
    if (product) {
      setActiveImg(product.img);
      if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0]);
      } else {
        setSelectedColor(null);
      }
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      } else {
        setSelectedSize("");
      }
    }
  }, [product]);

  // Recommended products (up to 4, in the same category, excluding active product)
  const recommendations = useMemo(() => {
    if (!product) return [];
    return MOCK_PRODUCTS.filter(
      (p) => p.category === product.category && p.id !== product.id
    ).slice(0, 4);
  }, [product]);

  if (!product) {
    return (
      <div className="bg-[#F5F0EB] min-h-screen flex flex-col items-center justify-center py-20 px-8 text-center text-[#1d1b20]">
        <h2 className="text-3xl font-extrabold mb-4">Product Not Found</h2>
        <p className="text-sm text-[#49454f] mb-8">
          The product you are looking for does not exist or has been removed.
        </p>
        <Link
          to="/shop-all"
          className="px-6 py-3 bg-[#4f378a] text-white font-bold rounded-full hover:bg-[#5f479a] transition-all no-underline shadow-md"
        >
          Back to Shop All
        </Link>
      </div>
    );
  }

  // Toggle accordions
  const toggleAccordion = (section) => {
    setAccordionOpen((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Toggle wishlist state (synced with global WishlistContext)
  const handleWishlistToggle = () => {
    toggleWishlist(product);
  };

  const handleAddToCart = () => {
    toast.success(
      `Added ${product.name} (${selectedColor?.name || "Default"}, Size ${selectedSize}) to cart`
    );
  };

  return (
    <div className="bg-[#F5F0EB] min-h-screen py-10 md:py-16 px-4 sm:px-8 md:px-16 text-[#1d1b20]">
      <div className="max-w-[1440px] mx-auto">
        
        {/* -- TODO: Backend Integration ---------------------------------------
            When integrating the real backend API:
            1. Fetch product by ID on load via `GET /api/products/${id}`.
            2. Pull recommended products dynamically based on current category:
               `GET /api/products?category=${product.category}&limit=4&exclude=${product.id}`
            3. Replace MOCK_PRODUCTS imports with local dynamic state or RTK Query hooks.
            -------------------------------------------------------------------- */}

        {/* BREADCRUMB NAVIGATION */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#49454f] mb-8">
          <Link to="/" className="hover:text-[#4f378a] transition-colors no-underline">
            Home
          </Link>
          <span>/</span>
          <Link to="/shop-all" className="hover:text-[#4f378a] transition-colors no-underline">
            Shop All
          </Link>
          <span>/</span>
          <span className="text-[#1d1b20] font-bold">{product.category}</span>
        </div>

        {/* MAIN PRODUCT VIEW CONTAINER */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-20">
          
          {/* LEFT COLUMN: PRODUCT GALLERY */}
          <div className="flex flex-col gap-4">
            
            {/* Active Highlight Image - constrained to 450px max-height to fit elegantly in a single screen */}
            <div className="relative aspect-square lg:aspect-auto lg:h-[450px] lg:max-h-[450px] w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-[#e6e0e9] bg-white">
              <img
                src={activeImg}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-500 ease-in-out"
              />
            </div>

            {/* Gallery Thumbnails row */}
            {product.thumbnails && product.thumbnails.length > 0 && (
              <div className="grid grid-cols-4 gap-3 sm:gap-4">
                {product.thumbnails.map((thumbUrl, idx) => {
                  const isActive = activeImg === thumbUrl;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImg(thumbUrl)}
                      className={`
                        aspect-square rounded-xl overflow-hidden cursor-pointer bg-white transition-all p-0 border-none
                        ${
                          isActive
                            ? "ring-2 ring-[#4f378a] border-2 border-transparent scale-102"
                            : "border border-[#e6e0e9] opacity-75 hover:opacity-100 hover:scale-102"
                        }
                      `}
                    >
                      <img
                        src={thumbUrl}
                        alt={`${product.name} view ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: PRODUCT SPECIFICATIONS & DETAILS */}
          <div className="flex flex-col">
            
            {/* Product Meta */}
            <h1 className="text-[32px] sm:text-[40px] md:text-[48px] font-extrabold tracking-tight leading-none mb-2">
              {product.name}
            </h1>
            <p className="text-2xl font-bold text-[#1d1b20]/90 mb-6">
              {product.price}
            </p>

            {/* Description */}
            <p className="text-sm sm:text-base text-[#49454f] font-medium leading-relaxed mb-8">
              {product.description}
            </p>

            {/* COLOR SELECTOR */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <span className="text-xs font-bold tracking-wider text-[#49454f] uppercase block mb-3">
                  COLOR: <span className="text-[#1d1b20] font-extrabold">{selectedColor?.name}</span>
                </span>
                
                <div className="flex gap-3">
                  {product.colors.map((color) => {
                    const isColorSelected = selectedColor?.name === color.name;
                    return (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color)}
                        style={{ backgroundColor: color.hex }}
                        className={`
                          w-8 h-8 rounded-full border border-black/10 cursor-pointer transition-all duration-300
                          ${
                            isColorSelected
                              ? "ring-2 ring-offset-2 ring-[#4f378a]"
                              : "hover:scale-110"
                          }
                        `}
                        title={color.name}
                        aria-label={`Select color ${color.name}`}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* SIZE SELECTOR */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold tracking-wider text-[#49454f] uppercase">
                    SIZE
                  </span>
                  
                  {/* Size Guide Dummy Link */}
                  <button
                    type="button"
                    onClick={() => toast.info("Size guide coming soon")}
                    className="text-xs font-bold tracking-wide text-[#4f378a] hover:opacity-80 underline bg-transparent border-none cursor-pointer p-0"
                  >
                    Size Guide
                  </button>
                </div>

                {/* Size Grid Blocks */}
                <div className="grid grid-cols-4 gap-2.5">
                  {product.sizes.map((size) => {
                    const isSizeActive = selectedSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`
                          py-3 text-xs sm:text-sm font-bold border rounded-xl cursor-pointer transition-all duration-300
                          ${
                            isSizeActive
                              ? "bg-[#f2ecf4] border-[#4f378a] text-[#4f378a] shadow-sm font-extrabold"
                              : "bg-white border-[#cbc4d2] text-[#1d1b20] hover:border-[#4f378a]"
                          }
                        `}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ACTIONS ROW */}
            <div className="flex gap-4 mb-8">
              
              {/* Add to Cart CTA */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="
                  flex-1 py-4 bg-[#4f378a] text-white font-bold rounded-full
                  cursor-pointer hover:bg-[#5f479a] transition-all hover:scale-[1.02]
                  shadow-[0_8px_24px_rgba(79,55,138,0.25)] text-center text-sm sm:text-base border-none
                "
              >
                Add to Cart
              </button>

              {/* Wishlist Button - Fixed w-[56px] h-[56px] sizing locks to prevent capsule squeezing distortion */}
              <button
                type="button"
                onClick={handleWishlistToggle}
                className="
                  w-[56px] h-[56px] min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px]
                  rounded-full border border-[#cbc4d2] bg-white
                  flex items-center justify-center cursor-pointer transition-all duration-300
                  hover:scale-[1.05] hover:border-[#4f378a] hover:text-[#4f378a] shrink-0 p-0
                "
                aria-label="Add to Wishlist"
              >
                {isProductInWishlist ? (
                  <FaHeart className="w-5 h-5 text-[#4f378a]" />
                ) : (
                  <FiHeart className="w-5 h-5 text-[#1d1b20]" />
                )}
              </button>
            </div>

            {/* COLLAPSIBLE ACCORDION SHEETS */}
            <div className="border-t border-[#e6e0e9] mt-2">
              
              {/* ACCORDION 1: DETAILS & COMPOSITION */}
              <div className="border-b border-[#e6e0e9] py-4">
                <button
                  type="button"
                  onClick={() => toggleAccordion("details")}
                  className="w-full flex justify-between items-center text-left bg-transparent border-none cursor-pointer p-0"
                >
                  <span className="text-xs sm:text-sm font-extrabold tracking-wider text-[#1d1b20]">
                    DETAILS & COMPOSITION
                  </span>
                  {accordionOpen.details ? (
                    <FiChevronUp className="w-5 h-5 text-[#49454f]" />
                  ) : (
                    <FiChevronDown className="w-5 h-5 text-[#49454f]" />
                  )}
                </button>

                {/* Content */}
                {accordionOpen.details && product.details && (
                  <ul className="mt-3.5 pl-5 list-disc text-xs sm:text-sm text-[#49454f] space-y-1.5 font-medium leading-relaxed">
                    {product.details.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* ACCORDION 2: SHIPPING & RETURNS */}
              <div className="border-b border-[#e6e0e9] py-4">
                <button
                  type="button"
                  onClick={() => toggleAccordion("shipping")}
                  className="w-full flex justify-between items-center text-left bg-transparent border-none cursor-pointer p-0"
                >
                  <span className="text-xs sm:text-sm font-extrabold tracking-wider text-[#1d1b20]">
                    SHIPPING & RETURNS
                  </span>
                  {accordionOpen.shipping ? (
                    <FiChevronUp className="w-5 h-5 text-[#49454f]" />
                  ) : (
                    <FiChevronDown className="w-5 h-5 text-[#49454f]" />
                  )}
                </button>

                {/* Content */}
                {accordionOpen.shipping && (
                  <div className="mt-3 text-xs sm:text-sm text-[#49454f] space-y-2 font-medium leading-relaxed">
                    <p>
                      We offer free standard worldwide shipping on all orders over $150. Shipping speeds
                      typically range from 3-5 business days for domestic orders and 5-10 business days for international orders.
                    </p>
                    <p>
                      Returns are accepted within 30 days of shipment. Items must be in their original,
                      unworn condition with all designer tags attached.
                    </p>
                  </div>
                )}
              </div>

              {/* ACCORDION 3: SUSTAINABILITY */}
              <div className="border-b border-[#e6e0e9] py-4">
                <button
                  type="button"
                  onClick={() => toggleAccordion("sustainability")}
                  className="w-full flex justify-between items-center text-left bg-transparent border-none cursor-pointer p-0"
                >
                  <span className="text-xs sm:text-sm font-extrabold tracking-wider text-[#1d1b20]">
                    SUSTAINABILITY & ETHICS
                  </span>
                  {accordionOpen.sustainability ? (
                    <FiChevronUp className="w-5 h-5 text-[#49454f]" />
                  ) : (
                    <FiChevronDown className="w-5 h-5 text-[#49454f]" />
                  )}
                </button>

                {/* Content */}
                {accordionOpen.sustainability && (
                  <div className="mt-3 text-xs sm:text-sm text-[#49454f] space-y-2 font-medium leading-relaxed">
                    <p>
                      As part of PEAK’s commitment to curated minimalism, we believe in slower consumption
                      cycles. That is why all our garments are crafted with GOTS Certified organic cotton, ethically
                      harvested and spun in wind-powered facilities.
                    </p>
                    <p>
                      Our manufacturer partners strictly adhere to fair wage frameworks and produce in limited
                      batches to eliminate textile landfill wastes.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* BARS: YOU MAY ALSO LIKE */}
        {recommendations.length > 0 && (
          <div className="border-t border-[#e6e0e9] pt-16 mt-20">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl sm:text-[30px] font-extrabold tracking-tight text-[#1d1b20]">
                You May Also Like
              </h2>
              
              <Link
                to="/shop-all"
                className="text-xs font-bold tracking-[0.1em] uppercase text-[#4f378a] no-underline hover:opacity-75 transition-opacity"
              >
                VIEW ALL
              </Link>
            </div>

            {/* Recommended 4-Column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {recommendations.map((recProduct) => (
                <SingleProductItem
                  key={recProduct.id}
                  name={recProduct.name}
                  price={recProduct.price}
                  img={recProduct.img}
                  onClick={() => navigate(`/product/${recProduct.id}`)}
                  onAddToCart={() => {
                    toast.success(`${recProduct.name} added to cart`);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
