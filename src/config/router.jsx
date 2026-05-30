import { createBrowserRouter, RouterProvider } from "react-router-dom";
import routes from "./routes";
import { WishlistProvider } from "../context/WishlistContext";

const router = createBrowserRouter(routes);

export default function RouterConfig() {
  return (
    <WishlistProvider>
      <RouterProvider router={router} />
    </WishlistProvider>
  );
}