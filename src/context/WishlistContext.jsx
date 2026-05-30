import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    // Persistent wishlist storage in localStorage
    const saved = localStorage.getItem("peak_wishlist");
    return saved ? JSON.parse(saved) : [];
  });
  const [isOpen, setIsOpen] = useState(false);

  // Sync with localStorage on change
  useEffect(() => {
    localStorage.setItem("peak_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Toggle dynamic wishlist updates with interactive toasts
  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        toast.info(`${product.name} removed from wishlist`, {
          action: {
            label: "Undo",
            onClick: () => toggleWishlist(product),
          },
        });
        return prev.filter((item) => item.id !== product.id);
      } else {
        toast.success(`${product.name} added to wishlist`, {
          action: {
            label: "View Wishlist",
            onClick: () => setIsOpen(true),
          },
        });
        return [...prev, product];
      }
    });
  };

  const isWishlisted = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  const clearWishlist = () => {
    setWishlist([]);
    toast.info("Wishlist cleared");
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isWishlisted,
        isOpen,
        setIsOpen,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
