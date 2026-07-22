import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiX, FiTrash2, FiHeart } from "react-icons/fi";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";

export default function WishlistDrawer() {
  const { wishlist, isOpen, setIsOpen, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const drawerRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden"; // Prevent background body scroll when drawer open
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, setIsOpen]);

  const handleItemClick = (id) => {
    setIsOpen(false);
    navigate(`/product/${id}`);
  };

  const handleAddToCart = (item, e) => {
    e.stopPropagation();
    addToCart(item, item.colors?.[0] || null, item.sizes?.[0] || "", 1);
  };

  const handleRemove = (item, e) => {
    e.stopPropagation();
    toggleWishlist(item);
  };

  return (
    <>
      {/* Backdrop overlay (fades in) */}
      <div
        onClick={() => setIsOpen(false)}
        className={`
          fixed inset-0 bg-black/40 backdrop-blur-sm z-[65] transition-opacity duration-300
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      />

      {/* Slide-over Drawer Panel */}
      <div
        ref={drawerRef}
        className={`
          fixed right-0 top-0 h-full w-full max-w-[400px] bg-[#F5F0EB] z-[70] shadow-2xl
          flex flex-col transition-transform duration-300 ease-out transform
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Drawer Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-[#e6e0e9] bg-white">
          <div className="flex items-center gap-2">
            <FiHeart className="w-5 h-5 text-[#4f378a]" />
            <h2 className="text-lg font-extrabold tracking-tight text-[#1d1b20]">
              My Wishlist
            </h2>
            {wishlist.length > 0 && (
              <span className="bg-[#4f378a] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {wishlist.length}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-full bg-[#f2ecf4] text-[#1d1b20] hover:bg-[#e9ddff] hover:scale-105 transition-all cursor-pointer border-none flex items-center justify-center"
            aria-label="Close Wishlist"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 pb-[80px] md:pb-4">
          {wishlist.length > 0 ? (
            <div className="space-y-4">
              {wishlist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className="
                    group flex gap-4 p-3 bg-white rounded-2xl border border-[#e6e0e9] shadow-[0_2px_8px_rgba(0,0,0,0.03)]
                    hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-[#4f378a]/20 transition-all cursor-pointer
                  "
                >
                  {/* Thumbnail Image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 border border-[#e6e0e9] shrink-0">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Meta details */}
                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div>
                      <h3 className="text-sm font-bold text-[#1d1b20] leading-snug group-hover:text-[#4f378a] transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[#49454f] font-semibold mt-0.5">
                        {item.category}
                      </p>
                    </div>
                    <span className="text-sm font-extrabold text-[#1d1b20]">
                      {item.price}
                    </span>
                  </div>

                  {/* Actions column */}
                  <div className="flex flex-col justify-between items-end shrink-0 pl-1">
                    {/* Delete Icon */}
                    <button
                      onClick={(e) => handleRemove(item, e)}
                      className="
                        p-2 text-[#49454f] hover:text-[#ba1a1a] hover:bg-[#ba1a1a]/5
                        rounded-full transition-all cursor-pointer border-none flex items-center justify-center
                      "
                      title="Remove from wishlist"
                      aria-label="Remove item"
                    >
                      <FiTrash2 className="w-4.5 h-4.5" />
                    </button>

                    {/* Quick Add To Cart Button */}
                    <button
                      onClick={(e) => handleAddToCart(item, e)}
                      className="
                        px-3 py-1.5 bg-[#4f378a] text-white text-[11px] font-extrabold rounded-lg
                        hover:bg-[#5f479a] hover:scale-102 transition-all cursor-pointer border-none
                      "
                    >
                      Buy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* EMPTY STATE */
            <div className="h-full flex flex-col items-center justify-center text-center py-20">
              <div className="w-16 h-16 rounded-full bg-[#f2ecf4] flex items-center justify-center text-[#4f378a] mb-5">
                <FiHeart className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#1d1b20] mb-2">
                Your Wishlist is Empty
              </h3>
              <p className="text-xs sm:text-sm text-[#49454f] max-w-[240px] leading-relaxed mb-8">
                Explore our curated essentials and add items to your custom wishlist collection.
              </p>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/shop-all");
                }}
                className="
                  px-6 py-3 bg-[#4f378a] text-white text-xs sm:text-sm font-bold rounded-full
                  hover:bg-[#5f479a] hover:scale-105 transition-all cursor-pointer border-none
                  shadow-[0_4px_12px_rgba(79,55,138,0.2)]
                "
              >
                Explore Collection
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
