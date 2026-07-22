import { createBrowserRouter, RouterProvider } from "react-router-dom";
import routes from "./routes";
import { WishlistProvider } from "../context/WishlistContext";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";

import { ProfileProvider } from "../context/ProfileContext";

// Inner component to read modal state from CartContext
const router = createBrowserRouter(routes);

export default function RouterConfig() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <ProfileProvider>
            <RouterProvider router={router} />
          </ProfileProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}