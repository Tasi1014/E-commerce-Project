import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { toast } from "sonner";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("peak_cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [isOpen, setIsOpen] = useState(false);

  // Sync with localStorage on change
  useEffect(() => {
    localStorage.setItem("peak_cart", JSON.stringify(cart));
  }, [cart]);

  // Helper to parse price string to number
  const parsePrice = (priceStr) => {
    if (typeof priceStr === "number") return priceStr;
    return parseFloat(priceStr.replace(/[^0-9.]/g, "")) || 0;
  };

  // Memoized subtotal calculation
  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => {
      return total + parsePrice(item.price) * item.quantity;
    }, 0);
  }, [cart]);

  // Add item to cart
  const addToCart = (product, color = null, size = "", qty = 1) => {
    const colorName = color ? (typeof color === "string" ? color : color.name) : "Default";
    const colorHex = color && typeof color === "object" ? color.hex : "";

    setCart((prev) => {
      // Find matching item in cart by ID, color, and size
      const existingIdx = prev.findIndex(
        (item) =>
          item.id === product.id &&
          item.colorName === colorName &&
          item.size === size
      );

      if (existingIdx > -1) {
        // Increment quantity of existing item
        const updated = [...prev];
        updated[existingIdx].quantity += qty;
        toast.success(`Updated ${product.name} quantity to ${updated[existingIdx].quantity}`, {
          action: {
            label: "View Cart",
            onClick: () => setIsOpen(true),
          },
        });
        return updated;
      } else {
        // Add new item to cart
        const newItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          img: product.img,
          category: product.category,
          colorName,
          colorHex,
          size,
          quantity: qty,
        };
        toast.success(`${product.name} added to cart`, {
          action: {
            label: "View Cart",
            onClick: () => setIsOpen(true),
          },
        });
        return [...prev, newItem];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (productId, colorName, size) => {
    setCart((prev) => {
      const itemToRemove = prev.find(
        (item) =>
          item.id === productId &&
          item.colorName === colorName &&
          item.size === size
      );
      if (itemToRemove) {
        toast.info(`${itemToRemove.name} removed from cart`);
      }
      return prev.filter(
        (item) =>
          !(item.id === productId && item.colorName === colorName && item.size === size)
      );
    });
  };

  // Update item quantity inside cart (+1 or -1)
  const updateQuantity = (productId, colorName, size, delta) => {
    setCart((prev) => {
      const idx = prev.findIndex(
        (item) =>
          item.id === productId &&
          item.colorName === colorName &&
          item.size === size
      );

      if (idx === -1) return prev;

      const updated = [...prev];
      const newQty = updated[idx].quantity + delta;

      if (newQty <= 0) {
        // Remove item if quantity falls to zero or below
        const itemToRemove = updated[idx];
        toast.info(`${itemToRemove.name} removed from cart`);
        return prev.filter(
          (item) =>
            !(item.id === productId && item.colorName === colorName && item.size === size)
        );
      } else {
        updated[idx].quantity = newQty;
        return updated;
      }
    });
  };

  const clearCart = () => {
    setCart([]);
    toast.info("Cart cleared");
  };

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
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
