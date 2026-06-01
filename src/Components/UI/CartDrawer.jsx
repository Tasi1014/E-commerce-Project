import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FiX, FiTrash2, FiMinus, FiPlus } from "react-icons/fi";
import { BsCart3 } from "react-icons/bs";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

export default function CartDrawer() {
  const { cart, isOpen, setIsOpen, removeFromCart, updateQuantity, subtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const drawerRef = useRef(null);

  // Close drawer on ESC key press
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

  const handleCheckout = () => {
    setIsOpen(false);
    if (user) {
      toast.success("Proceeding to checkout...", {
        description: "Checking database stock and initializing order payload...",
      });
      // Future integration: redirect to actual checkout page
    } else {
      toast.warning("Please login to proceed to checkout.");
      navigate("/login");
    }
  };

  return (
    <>
      {/* Backdrop overlay (fades in) */}
      <div
        onClick={() => setIsOpen(false)}
        className={`
          fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      />

      {/* Slide-over Drawer Panel */}
      <div
        ref={drawerRef}
        className={`
          fixed right-0 top-0 h-full w-full max-w-[400px] bg-[#F5F0EB] z-50 shadow-2xl
          flex flex-col transition-transform duration-300 ease-out transform
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Drawer Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-[#e6e0e9] bg-white">
          <div className="flex items-center gap-2">
            <BsCart3 className="w-5 h-5 text-[#4f378a]" />
            <h2 className="text-lg font-extrabold tracking-tight text-[#1d1b20]">
              Shopping Cart
            </h2>
            {cart.length > 0 && (
              <span className="bg-[#4f378a] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {cart.reduce((total, item) => total + item.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-full bg-[#f2ecf4] text-[#1d1b20] hover:bg-[#e9ddff] hover:scale-105 transition-all cursor-pointer border-none flex items-center justify-center"
            aria-label="Close Cart"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cart.length > 0 ? (
            <div className="space-y-4">
              {cart.map((item, idx) => (
                <div
                  key={`${item.id}-${item.colorName}-${item.size}-${idx}`}
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
                        {item.colorName} • Size {item.size}
                      </p>
                    </div>

                    {/* Quantity selectors */}
                    <div className="flex items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => updateQuantity(item.id, item.colorName, item.size, -1)}
                        className="w-6 h-6 rounded bg-[#f2ecf4] border-none text-[#1d1b20] hover:bg-[#e9ddff] transition-colors flex items-center justify-center cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <FiMinus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-bold w-6 text-center text-[#1d1b20]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.colorName, item.size, 1)}
                        className="w-6 h-6 rounded bg-[#f2ecf4] border-none text-[#1d1b20] hover:bg-[#e9ddff] transition-colors flex items-center justify-center cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <FiPlus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Price & Delete column */}
                  <div className="flex flex-col justify-between items-end shrink-0 pl-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromCart(item.id, item.colorName, item.size);
                      }}
                      className="
                        p-2 text-[#49454f] hover:text-[#ba1a1a] hover:bg-[#ba1a1a]/5
                        rounded-full transition-all cursor-pointer border-none flex items-center justify-center
                      "
                      title="Remove from cart"
                      aria-label="Remove item"
                    >
                      <FiTrash2 className="w-4.5 h-4.5" />
                    </button>
                    <span className="text-sm font-extrabold text-[#1d1b20]">
                      {item.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* EMPTY STATE */
            <div className="h-full flex flex-col items-center justify-center text-center py-20">
              <div className="w-16 h-16 rounded-full bg-[#f2ecf4] flex items-center justify-center text-[#4f378a] mb-5">
                <BsCart3 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-[#1d1b20] mb-2">
                Your Cart is Empty
              </h3>
              <p className="text-xs sm:text-sm text-[#49454f] max-w-[240px] leading-relaxed mb-8">
                Curate your modern space. Add essentials to your bag to get started.
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
                Shop Collection
              </button>
            </div>
          )}
        </div>

        {/* Footer Subtotal & Checkout Actions */}
        {cart.length > 0 && (
          <div className="bg-white border-t border-[#e6e0e9] p-6 space-y-4">
            <div className="flex justify-between items-center text-[#1d1b20]">
              <span className="text-sm font-bold uppercase tracking-wider text-[#49454f]">
                Subtotal
              </span>
              <span className="text-xl font-extrabold">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            
            <button
              onClick={handleCheckout}
              className="
                w-full py-4 bg-[#4f378a] text-white font-extrabold rounded-full text-center text-sm
                cursor-pointer hover:bg-[#5f479a] hover:scale-[1.01] transition-all border-none
                shadow-[0_8px_24px_rgba(79,55,138,0.2)]
              "
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
