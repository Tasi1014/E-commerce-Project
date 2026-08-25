# Graph Report - .  (2026-08-05)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 363 nodes · 667 edges · 20 communities (18 shown, 2 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 50 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b35d5090`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- OrderController.js
- CartContext.jsx
- routes.jsx
- dependencies
- Server/package.json
- devDependencies
- Login.jsx
- HomePage.jsx
- ProductDetailPage.jsx
- AuthController.js
- server.js
- dependencies
- products.js
- vercel.json

## God Nodes (most connected - your core abstractions)
1. `useCart()` - 23 edges
2. `useAuth()` - 21 edges
3. `axiosInstance` - 13 edges
4. `useWishlist()` - 11 edges
5. `CartProvider()` - 8 edges
6. `HomeHeader()` - 7 edges
7. `fetchProducts()` - 7 edges
8. `useProfile()` - 7 edges
9. `WishlistProvider()` - 7 edges
10. `authenticateToken()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `ProductSection()` --calls--> `useCart()`  [EXTRACTED]
  Client/src/Components/Home/Product.jsx → Client/src/context/CartContext.jsx
- `Login()` --calls--> `useAuth()`  [EXTRACTED]
  Client/src/pages/auth/Login.jsx → Client/src/context/AuthContext.jsx
- `Register()` --calls--> `useAuth()`  [EXTRACTED]
  Client/src/pages/auth/Register.jsx → Client/src/context/AuthContext.jsx
- `CheckoutPage()` --calls--> `useAuth()`  [EXTRACTED]
  Client/src/pages/CheckoutPage.jsx → Client/src/context/AuthContext.jsx
- `CheckoutPage()` --calls--> `useCart()`  [EXTRACTED]
  Client/src/pages/CheckoutPage.jsx → Client/src/context/CartContext.jsx

## Import Cycles
- None detected.

## Communities (20 total, 2 thin omitted)

### Community 0 - "OrderController.js"
Cohesion: 0.05
Nodes (44): products, addToCart(), getCart(), removeCartItem(), updateCartItem(), createOrder(), getAdminStats(), getAllOrders() (+36 more)

### Community 1 - "CartContext.jsx"
Cohesion: 0.10
Nodes (35): addToCartApi(), fetchCart(), removeCartItemApi(), updateCartItemApi(), addToWishlistApi(), fetchWishlist(), removeFromWishlistApi(), HomeFooter() (+27 more)

### Community 2 - "routes.jsx"
Cohesion: 0.10
Nodes (22): axiosInstance, createOrder(), fetchOrderById(), fetchUserOrders(), createStripeCheckoutSession(), verifyStripePaymentAndCreateOrder(), DEFAULT_CENTER, LocationPicker() (+14 more)

### Community 3 - "dependencies"
Cohesion: 0.05
Nodes (37): axios, dependencies, axios, @hookform/resolvers, leaflet, lucide-react, react, react-dom (+29 more)

### Community 4 - "Server/package.json"
Cohesion: 0.06
Nodes (32): bcryptjs, cors, dotenv, express, jsonwebtoken, mongoose, author, dependencies (+24 more)

### Community 5 - "devDependencies"
Cohesion: 0.06
Nodes (30): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, nodemon, @types/react (+22 more)

### Community 6 - "Login.jsx"
Cohesion: 0.15
Nodes (14): adminLogin(), loginUser(), registerUser(), FormButton(), FormContainer(), FormInput(), ProductFormModal(), Login() (+6 more)

### Community 7 - "HomePage.jsx"
Cohesion: 0.16
Nodes (9): Hero(), Features, Newsletter(), stats, StorySection(), reviews, Testimonials(), HomePage() (+1 more)

### Community 8 - "ProductDetailPage.jsx"
Cohesion: 0.31
Nodes (9): fetchProductById(), fetchProducts(), searchProducts(), categoryTabs, collections, ProductSection(), SingleProductItem(), ProductDetailPage() (+1 more)

### Community 9 - "AuthController.js"
Cohesion: 0.27
Nodes (9): adminLogin(), generateToken(), getAllUsers(), login(), logout(), register(), userSchema, loginSchema (+1 more)

### Community 10 - "server.js"
Cohesion: 0.39
Nodes (4): app, config, MongoConfig, router

### Community 11 - "dependencies"
Cohesion: 0.50
Nodes (3): nodemailer, dependencies, nodemailer

## Knowledge Gaps
- **84 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+79 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `devDependencies`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `CartContext.jsx` to `routes.jsx`, `Login.jsx`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _84 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `OrderController.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05134575569358178 - nodes in this community are weakly interconnected._
- **Should `CartContext.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10014513788098693 - nodes in this community are weakly interconnected._
- **Should `routes.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10365853658536585 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._