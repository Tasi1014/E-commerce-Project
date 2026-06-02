import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { fetchWishlist, addToWishlistApi, removeFromWishlistApi } from "../api/wishlistApi";

const WishlistContext = createContext(null);

// Transform backend product object to frontend format
const transformWishlistItem = (product) => ({
  id: product._id,
  name: product.name,
  price: `$${product.price.toFixed(2)}`,
  img: product.mainImage,
  category: product.category,
});

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Load wishlist from backend when user logs in
  useEffect(() => {
    if (user) {
      loadWishlist();
    } else {
      setWishlist([]);
    }
  }, [user]);

  const loadWishlist = async () => {
    try {
      const response = await fetchWishlist();
      const products = response.data.wishlist.products || [];
      setWishlist(products.map(transformWishlistItem));
    } catch (err) {
      console.error("Failed to load wishlist", err);
      toast.error("Could not load your wishlist");
    }
  };

  const toggleWishlist = async (product) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    const isPresent = wishlist.some((item) => item.id === product.id);
    try {
      if (isPresent) {
        await removeFromWishlistApi(product.id);
        await loadWishlist();
        toast.info(`${product.name} removed from wishlist`, {
          action: { label: "Undo", onClick: () => toggleWishlist(product) },
        });
      } else {
        await addToWishlistApi(product.id);
        await loadWishlist();
        toast.success(`${product.name} added to wishlist`, {
          action: { label: "View Wishlist", onClick: () => setIsOpen(true) },
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Wishlist operation failed");
    }
  };

  const isWishlisted = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  const clearWishlist = () => {
    if (!user) return;
    toast.info("Clear all not implemented for wishlist");
  };

  const closeLoginModal = () => setShowLoginModal(false);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isWishlisted,
        isOpen,
        setIsOpen,
        clearWishlist,
        showLoginModal,
        closeLoginModal,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within a WishlistProvider");
  return context;
}