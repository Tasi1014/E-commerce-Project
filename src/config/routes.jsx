/**
 * routes.jsx
 * ─────────────────────────────────────────────
 * Central route configuration for the PEAK e-commerce app.
 * Uses React Router v7 data router format (createBrowserRouter).
 *
 * Auth pages (Login, Register) now live in src/pages/auth/
 * and use the React Hook Form + Zod pattern.
 */

import HomeLayout from "../layouts/HomeLayout.jsx";
import HomePage from "../pages/home/HomePage.jsx";

// ── Auth pages (React Hook Form + Zod) ──────────────────────────────────────
import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";

// ── Other pages ─────────────────────────────────────────────────────────────
import NewArrivalsPage from "../pages/NewArrivalsPage.jsx";
import ShopAllPage from "../pages/ShopAllPage.jsx";
import StoryPage from "../pages/StoryPage.jsx";
import ContactUsPage from "../pages/ContactUsPage.jsx";

const routes = [
  {
    path: "/",
    Component: HomeLayout,
    children: [
      // Home
      {
        index: true,
        Component: HomePage,
      },

      // ── Auth routes ────────────────────────────────────────────────────
      {
        path: "login",
        Component: Login,
      },
      {
        path: "register",
        Component: Register,
      },

      // ── Shop routes ────────────────────────────────────────────────────
      {
        path: "new-arrivals",
        Component: NewArrivalsPage,
      },
      {
        path: "shop-all",
        Component: ShopAllPage,
      },

      // ── Content routes ─────────────────────────────────────────────────
      {
        path: "story",
        Component: StoryPage,
      },
      {
        path: "contact-us",
        Component: ContactUsPage,
      },
    ],
  },
];

export default routes;