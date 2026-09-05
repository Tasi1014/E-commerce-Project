import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import 'leaflet/dist/leaflet.css';
import RouterConfig from "./config/router";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      {/* Sonner toast portal — mounted once at root, available on every page */}
      <Toaster
        position="bottom-right"
        richColors
        expand={false}
        duration={3000}
        toastOptions={{
          style: { fontFamily: "inherit", fontSize: "13px" },
        }}
      />
      <RouterConfig />
    </GoogleOAuthProvider>
  </StrictMode>
);