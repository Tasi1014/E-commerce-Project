import { createBrowserRouter, RouterProvider } from "react-router-dom";
import routes from "./routes";
import { WishlistProvider } from "../context/WishlistContext";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";

const router = createBrowserRouter(routes);

export default function RouterConfig() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <RouterProvider router={router} />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}