import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FiChevronDown, FiChevronUp, FiHeart, FiMinus, FiPlus } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import SingleProductItem from "../Components/Product/SingleProductGridItem";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { fetchProductById, fetchProducts } from "../api/productApi";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  // Product state
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);

  // Quantity state (new)
  const [quantity, setQuantity] = useState(1);

  // UI states (unchanged)
  const [activeImg, setActiveImg] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [accordionOpen, setAccordionOpen] = useState({
    details: true,
    shipping: false,
    sustainability: false,
  });

  // Quantity handlers
  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  // Fetch product and recommendations (exactly 4, filtered)
  useEffect(() => {
    const loadProductData = async () => {
      setLoading(true);
      try {
        const productRes = await fetchProductById(id);
        const fetchedProduct = productRes.data.product;

        const mappedProduct = {
          id: fetchedProduct._id,
          name: fetchedProduct.name,
          price: `$${fetchedProduct.price.toFixed(2)}`,
          img: fetchedProduct.mainImage,
          description: fetchedProduct.description,
          category: fetchedProduct.category,
          colors: fetchedProduct.colors || [],
          sizes: fetchedProduct.sizes || [],
          thumbnails: fetchedProduct.images || [],
          details: fetchedProduct.details || [],
        };

        setProduct(mappedProduct);
        setActiveImg(mappedProduct.img);
        if (mappedProduct.colors.length) setSelectedColor(mappedProduct.colors[0]);
        if (mappedProduct.sizes.length) setSelectedSize(mappedProduct.sizes[0]);

        // Fetch recommendations (limit 4, same category)
        const recRes = await fetchProducts({
          category: mappedProduct.category,
          limit: 4,
        });
        // Filter out current product (in case backend didn't exclude)
        const filtered = recRes.data.products.filter(p => p._id !== fetchedProduct._id);
        const mappedRecs = filtered.map(p => ({
          id: p._id,
          name: p.name,
          price: `$${p.price.toFixed(2)}`,
          img: p.mainImage,
          category: p.category,
        }));
        setRecommendations(mappedRecs.slice(0, 4));
      } catch (err) {
        console.error("Failed to load product", err);
        toast.error("Product not found");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    loadProductData();
  }, [id]);

  // Scroll to top on product load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [product]);

  const isProductInWishlist = isWishlisted(product ? product.id : null);

  const toggleAccordion = (section) => {
    setAccordionOpen(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleWishlistToggle = () => {
    if (product) toggleWishlist(product);
  };

  const handleAddToCart = () => {
    if (!product) return;
    // Pass quantity as the 4th argument (addToCart signature: product, color, size, quantity)
    addToCart(product, selectedColor, selectedSize, quantity);
    toast.success(`${quantity} × ${product.name} added to cart`);
  };

  if (loading) {
    return (
      <div className="bg-[#F5F0EB] min-h-screen flex items-center justify-center">
        <div className="text-[#49454f]">Loading product details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-[#F5F0EB] min-h-screen flex flex-col items-center justify-center py-20 px-8 text-center">
        <h2 className="text-3xl font-extrabold mb-4">Product Not Found</h2>
        <p className="text-sm text-[#49454f] mb-8">
          The product you are looking for does not exist or has been removed.
        </p>
        <Link
          to="/shop-all"
          className="px-6 py-3 bg-[#4f378a] text-white font-bold rounded-full hover:bg-[#5f479a] transition-all"
        >
          Back to Shop All
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F0EB] min-h-screen py-10 md:py-16 px-4 sm:px-8 md:px-16 text-[#1d1b20]">
      <div className="max-w-[1440px] mx-auto">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#49454f] mb-8">
          <Link to="/" className="hover:text-[#4f378a] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop-all" className="hover:text-[#4f378a] transition-colors">Shop All</Link>
          <span>/</span>
          <span className="text-[#1d1b20] font-bold">{product.category}</span>
        </div>

        {/* MAIN PRODUCT SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-20">
          {/* LEFT COLUMN: GALLERY */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square lg:aspect-auto lg:h-[450px] lg:max-h-[450px] w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-[#e6e0e9] bg-white">
              <img src={activeImg} alt={product.name} className="w-full h-full object-cover transition-all duration-500" />
            </div>
            {product.thumbnails && product.thumbnails.length > 0 && (
              <div className="grid grid-cols-4 gap-3 sm:gap-4">
                {product.thumbnails.map((thumbUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImg(thumbUrl)}
                    className={`aspect-square rounded-xl overflow-hidden cursor-pointer bg-white transition-all p-0 border-none ${
                      activeImg === thumbUrl
                        ? "ring-2 ring-[#4f378a] border-2 border-transparent scale-102"
                        : "border border-[#e6e0e9] opacity-75 hover:opacity-100 hover:scale-102"
                    }`}
                  >
                    <img src={thumbUrl} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: DETAILS */}
          <div className="flex flex-col">
            <h1 className="text-[32px] sm:text-[40px] md:text-[48px] font-extrabold tracking-tight leading-none mb-2">
              {product.name}
            </h1>
            <p className="text-2xl font-bold text-[#1d1b20]/90 mb-6">{product.price}</p>
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
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      style={{ backgroundColor: color.hex }}
                      className={`w-8 h-8 rounded-full border border-black/10 cursor-pointer transition-all duration-300 ${
                        selectedColor?.name === color.name ? "ring-2 ring-offset-2 ring-[#4f378a]" : "hover:scale-110"
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* SIZE SELECTOR */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold tracking-wider text-[#49454f] uppercase">SIZE</span>
                  <button
                    type="button"
                    onClick={() => toast.info("Size guide coming soon")}
                    className="text-xs font-bold tracking-wide text-[#4f378a] hover:opacity-80 underline bg-transparent border-none cursor-pointer p-0"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2.5">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 text-xs sm:text-sm font-bold border rounded-xl cursor-pointer transition-all duration-300 ${
                        selectedSize === size
                          ? "bg-[#f2ecf4] border-[#4f378a] text-[#4f378a] shadow-sm font-extrabold"
                          : "bg-white border-[#cbc4d2] text-[#1d1b20] hover:border-[#4f378a]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-4 items-center mb-8">
              {/* Quantity selector */}
              <div className="flex items-center border border-[#cbc4d2] rounded-full overflow-hidden bg-white">
                <button
                  onClick={decreaseQuantity}
                  className="w-10 h-10 flex items-center justify-center text-[#1d1b20] hover:bg-[#f2ecf4] transition-colors"
                  aria-label="Decrease quantity"
                >
                  <FiMinus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold text-[#1d1b20]">{quantity}</span>
                <button
                  onClick={increaseQuantity}
                  className="w-10 h-10 flex items-center justify-center text-[#1d1b20] hover:bg-[#f2ecf4] transition-colors"
                  aria-label="Increase quantity"
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 py-4 bg-[#4f378a] text-white font-bold rounded-full cursor-pointer hover:bg-[#5f479a] transition-all hover:scale-[1.02] shadow-[0_8px_24px_rgba(79,55,138,0.25)] text-center text-sm sm:text-base border-none"
              >
                Add to Cart
              </button>

              {/* Wishlist button */}
              <button
                type="button"
                onClick={handleWishlistToggle}
                className="w-[56px] h-[56px] min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px] rounded-full border border-[#cbc4d2] bg-white flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-[1.05] hover:border-[#4f378a] hover:text-[#4f378a] shrink-0 p-0"
                aria-label="Add to Wishlist"
              >
                {isProductInWishlist ? <FaHeart className="w-5 h-5 text-[#4f378a]" /> : <FiHeart className="w-5 h-5 text-[#1d1b20]" />}
              </button>
            </div>

            {/* ACCORDIONS */}
            <div className="border-t border-[#e6e0e9] mt-2">
              {product.details && product.details.length > 0 && (
                <div className="border-b border-[#e6e0e9] py-4">
                  <button onClick={() => toggleAccordion("details")} className="w-full flex justify-between items-center text-left bg-transparent border-none cursor-pointer p-0">
                    <span className="text-xs sm:text-sm font-extrabold tracking-wider text-[#1d1b20]">DETAILS & COMPOSITION</span>
                    {accordionOpen.details ? <FiChevronUp className="w-5 h-5 text-[#49454f]" /> : <FiChevronDown className="w-5 h-5 text-[#49454f]" />}
                  </button>
                  {accordionOpen.details && (
                    <ul className="mt-3.5 pl-5 list-disc text-xs sm:text-sm text-[#49454f] space-y-1.5 font-medium leading-relaxed">
                      {product.details.map((detail, idx) => <li key={idx}>{detail}</li>)}
                    </ul>
                  )}
                </div>
              )}
              <div className="border-b border-[#e6e0e9] py-4">
                <button onClick={() => toggleAccordion("shipping")} className="w-full flex justify-between items-center text-left bg-transparent border-none cursor-pointer p-0">
                  <span className="text-xs sm:text-sm font-extrabold tracking-wider text-[#1d1b20]">SHIPPING & RETURNS</span>
                  {accordionOpen.shipping ? <FiChevronUp className="w-5 h-5 text-[#49454f]" /> : <FiChevronDown className="w-5 h-5 text-[#49454f]" />}
                </button>
                {accordionOpen.shipping && (
                  <div className="mt-3 text-xs sm:text-sm text-[#49454f] space-y-2 font-medium leading-relaxed">
                    <p>Free standard worldwide shipping on orders over $150. 3-5 business days domestic, 5-10 international.</p>
                    <p>Returns accepted within 30 days. Items must be unworn with tags attached.</p>
                  </div>
                )}
              </div>
              <div className="border-b border-[#e6e0e9] py-4">
                <button onClick={() => toggleAccordion("sustainability")} className="w-full flex justify-between items-center text-left bg-transparent border-none cursor-pointer p-0">
                  <span className="text-xs sm:text-sm font-extrabold tracking-wider text-[#1d1b20]">SUSTAINABILITY & ETHICS</span>
                  {accordionOpen.sustainability ? <FiChevronUp className="w-5 h-5 text-[#49454f]" /> : <FiChevronDown className="w-5 h-5 text-[#49454f]" />}
                </button>
                {accordionOpen.sustainability && (
                  <div className="mt-3 text-xs sm:text-sm text-[#49454f] space-y-2 font-medium leading-relaxed">
                    <p>PEAK uses GOTS Certified organic cotton, ethically sourced materials, and limited‑batch production to reduce waste.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* YOU MAY ALSO LIKE – exactly 4 products */}
        {recommendations.length > 0 && (
          <div className="border-t border-[#e6e0e9] pt-16 mt-20">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl sm:text-[30px] font-extrabold tracking-tight text-[#1d1b20]">You May Also Like</h2>
              <Link to="/shop-all" className="text-xs font-bold tracking-[0.1em] uppercase text-[#4f378a] hover:opacity-75 transition-opacity">VIEW ALL</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {recommendations.map((rec) => (
                <SingleProductItem
                  key={rec.id}
                  name={rec.name}
                  price={rec.price}
                  img={rec.img}
                  onClick={() => navigate(`/product/${rec.id}`)}
                  onAddToCart={() => toast.success(`${rec.name} added to cart`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}