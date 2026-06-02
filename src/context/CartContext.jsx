import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { fetchCart, addToCartApi, updateCartItemApi, removeCartItemApi } from "../api/CartApi.js";

const CartContext = createContext(null);

// Helper to transform backend cart item to what CartDrawer expects
const transformCartItem = (item) => ({
  id: item.product?._id || item.product,   // product ID (for navigation)
  _id: item._id,                           // cart item ID (for API calls)
  name: item.name,
  price: `$${item.price.toFixed(2)}`,      // formatted string e.g. "$420.00"
  img: item.image,                         // map backend "image" to "img"
  colorName: item.colorName || "Default",
  size: item.size || "",
  quantity: item.quantity,
});

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Load cart from backend when user logs in
  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setCart([]);
    }
  }, [user]);

  const loadCart = async () => {
    try {
      const response = await fetchCart();
      const items = response.data.cart.items || [];
      setCart(items.map(transformCartItem));
    } catch (err) {
      console.error("Failed to load cart", err);
      toast.error("Could not load your cart");
    }
  };

  // Helper to parse price (works with number or formatted string)
  const parsePrice = (price) => {
    if (typeof price === "number") return price;
    return parseFloat(price.replace(/[^0-9.]/g, "")) || 0;
  };

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => total + parsePrice(item.price) * item.quantity, 0);
  }, [cart]);

  const addToCart = async (product, color = null, size = "", qty = 1) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    try {
      const response = await addToCartApi(product.id, qty);
      const newItems = (response.data.cart.items || []).map(transformCartItem);
      setCart(newItems);
      toast.success(`${qty} × ${product.name} added to cart`, {
        action: { label: "View Cart", onClick: () => setIsOpen(true) },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to cart");
    }
  };

  const removeFromCart = async (productId, colorName, size) => {
    if (!user) return;
    const cartItem = cart.find(item => item.id === productId);
    if (!cartItem || !cartItem._id) {
      toast.error("Item not found in cart");
      return;
    }
    try {
      const response = await removeCartItemApi(cartItem._id);
      const newItems = (response.data.cart.items || []).map(transformCartItem);
      setCart(newItems);
      toast.info("Item removed from cart");
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  const updateQuantity = async (productId, colorName, size, delta) => {
    if (!user) return;
    const cartItem = cart.find(item => item.id === productId);
    if (!cartItem || !cartItem._id) return;
    const newQty = cartItem.quantity + delta;
    if (newQty <= 0) {
      await removeFromCart(productId, colorName, size);
    } else {
      try {
        const response = await updateCartItemApi(cartItem._id, newQty);
        const newItems = (response.data.cart.items || []).map(transformCartItem);
        setCart(newItems);
      } catch (err) {
        toast.error("Failed to update quantity");
      }
    }
  };

  const clearCart = () => {
    if (!user) return;
    toast.info("Clear all not implemented");
  };

  const closeLoginModal = () => setShowLoginModal(false);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isOpen,
        setIsOpen,
        subtotal,
        showLoginModal,
        closeLoginModal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}