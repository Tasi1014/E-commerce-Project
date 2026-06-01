/**
 * AdminDashboard.jsx
 * ─────────────────────────────────────────────
 * Main admin dashboard page — static data for now.
 *
 * TODO (Backend integration):
 *   - Replace STATIC_STATS with: GET /api/admin/stats
 *   - Replace TOP_PRODUCTS with:  GET /api/admin/products?sort=revenue&limit=5
 *   - Replace RECENT_ORDERS with: GET /api/admin/orders?limit=10&sort=latest
 *   - Use React Query or SWR for polling + caching
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { FiFilter, FiMoreVertical, FiArrowUpRight, FiTrendingUp } from "react-icons/fi";

/* ══ STATIC MOCK DATA ════════════════════════════════════════════════════ */
const STATS = [
  {
    id: "revenue",
    label: "Total Revenue",
    value: "$124.5k",
    change: "+12.5%",
    positive: true,
    // Sparkline path data points (normalized 0–40 height, left→right)
    sparkline: "M0,35 C10,30 15,20 25,22 C35,24 40,12 50,10 C60,8 65,15 75,12 C85,9 90,5 100,2",
  },
  {
    id: "orders",
    label: "Total Orders",
    value: "1,240",
    change: "+8.2%",
    positive: true,
    sparkline: "M0,32 C10,28 20,26 30,20 C40,14 50,18 60,12 C70,6 80,10 90,6 C95,4 98,3 100,2",
  },
  {
    id: "customers",
    label: "New Customers",
    value: "85",
    change: "+4.1%",
    positive: true,
    sparkline: "M0,38 C15,34 20,32 35,24 C45,18 55,22 65,16 C75,10 85,8 100,4",
  },
  {
    id: "conversion",
    label: "Conversion Rate",
    value: "3.2%",
    change: "+0.5%",
    positive: true,
    sparkline: "M0,36 C10,33 25,30 35,26 C45,22 55,20 65,16 C75,12 85,10 100,6",
  },
];

const TOP_PRODUCTS = [
  {
    id: 1,
    name: "Phantom X Watch",
    category: "Electronics",
    revenue: "$2,450",
    sold: "412 sold",
    img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop&auto=format",
  },
  {
    id: 2,
    name: "Sonic Core Pro",
    category: "Audio",
    revenue: "$1,890",
    sold: "385 sold",
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop&auto=format",
  },
  {
    id: 3,
    name: "Vertex Chrono",
    category: "Fashion",
    revenue: "$3,120",
    sold: "290 sold",
    img: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=80&h=80&fit=crop&auto=format",
  },
  {
    id: 4,
    name: "Summit Leather Jacket",
    category: "Apparel",
    revenue: "$4,200",
    sold: "178 sold",
    img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=80&h=80&fit=crop&auto=format",
  },
  {
    id: 5,
    name: "Horizon Sunglasses",
    category: "Accessories",
    revenue: "$980",
    sold: "520 sold",
    img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=80&h=80&fit=crop&auto=format",
  },
];

const RECENT_ORDERS = [
  {
    id: "#PK-9401",
    customer: { name: "John Dorsey",   initials: "JD", color: "#4f378a" },
    product: "Phantom X Watch",
    amount: "$599.00",
    status: "Shipped",
    statusColor: "text-[#34d399] bg-[#34d399]/10 border-[#34d399]/20",
  },
  {
    id: "#PK-9402",
    customer: { name: "Sarah Miller",  initials: "SM", color: "#c2410c" },
    product: "Sonic Core Pro",
    amount: "$249.00",
    status: "Processing",
    statusColor: "text-[#fb923c] bg-[#fb923c]/10 border-[#fb923c]/20",
  },
  {
    id: "#PK-9403",
    customer: { name: "Robert King",   initials: "RK", color: "#0369a1" },
    product: "Vertex Chrono",
    amount: "$1,200.00",
    status: "Delivered",
    statusColor: "text-[#22d3ee] bg-[#22d3ee]/10 border-[#22d3ee]/20",
  },
  {
    id: "#PK-9404",
    customer: { name: "Emily Watson",  initials: "EW", color: "#7c3aed" },
    product: "Summit Leather Jacket",
    amount: "$340.00",
    status: "Pending",
    statusColor: "text-[#facc15] bg-[#facc15]/10 border-[#facc15]/20",
  },
  {
    id: "#PK-9405",
    customer: { name: "Marcus Lee",    initials: "ML", color: "#065f46" },
    product: "Horizon Sunglasses",
    amount: "$89.00",
    status: "Cancelled",
    statusColor: "text-[#f87171] bg-[#f87171]/10 border-[#f87171]/20",
  },
];

/* ══ SPARKLINE MINI CHART ════════════════════════════════════════════════ */
function Sparkline({ path, positive }) {
  const color = positive ? "#7c5cbf" : "#f87171";
  return (
    <svg width="100" height="40" viewBox="0 0 100 40" fill="none" className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${path.slice(0,5)}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={path} stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/* ══ COMPONENT ═══════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const [orderActionMenu, setOrderActionMenu] = useState(null);

  return (
    <div className="space-y-8 text-[#e8e3f0]">

      {/* ── Welcome Header ──────────────────────── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Welcome back, Admin
        </h1>
        <p className="text-sm text-[#9ca3af] mt-1">
          System status is operational. Here&apos;s what happened today.
        </p>
      </div>

      {/* ── Stats Grid ──────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <div
            key={stat.id}
            className="bg-[#1a1a24] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-3
              hover:border-[#7c5cbf]/30 transition-all duration-300 group"
          >
            {/* Label row */}
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#6b7280]">
              {stat.label}
            </span>

            {/* Value + sparkline */}
            <div className="flex items-end justify-between">
              <span className="text-[28px] font-extrabold text-white leading-none tracking-tight">
                {stat.value}
              </span>
              <Sparkline path={stat.sparkline} positive={stat.positive} />
            </div>

            {/* Change badge */}
            <div className="flex items-center gap-1.5">
              <span
                className={`text-xs font-bold flex items-center gap-1 ${
                  stat.positive ? "text-[#34d399]" : "text-[#f87171]"
                }`}
              >
                <FiArrowUpRight className="w-3 h-3" />
                {stat.change}
              </span>
              <span className="text-xs text-[#6b7280]">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Top Products ────────────────────────── */}
      <div className="bg-[#1a1a24] border border-white/[0.06] rounded-2xl p-6">
        {/* Section header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <FiTrendingUp className="w-5 h-5 text-[#7c5cbf]" />
            Top Products
          </h2>
          <Link
            to="/admin/products"
            className="text-xs font-bold text-[#7c5cbf] hover:text-[#c8b7ff] transition-colors no-underline"
          >
            View All
          </Link>
        </div>

        {/* Product rows */}
        <div className="space-y-1">
          {TOP_PRODUCTS.map((product, idx) => (
            <div
              key={product.id}
              className="flex items-center gap-4 py-3 px-3 rounded-xl hover:bg-white/[0.04] transition-colors group"
            >
              {/* Rank */}
              <span className="text-xs font-bold text-[#6b7280] w-4 text-center">{idx + 1}</span>

              {/* Image */}
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#252532] border border-white/[0.08] shrink-0">
                <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
              </div>

              {/* Name + Category */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#e8e3f0] truncate group-hover:text-white transition-colors">
                  {product.name}
                </p>
                <p className="text-xs text-[#6b7280]">{product.category}</p>
              </div>

              {/* Revenue + Sold */}
              <div className="text-right shrink-0">
                <p className="text-sm font-extrabold text-white">{product.revenue}</p>
                <p className="text-xs text-[#6b7280]">{product.sold}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent Orders ───────────────────────── */}
      <div className="bg-[#1a1a24] border border-white/[0.06] rounded-2xl p-6">
        {/* Section header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-extrabold text-white">Recent Orders</h2>
          <button
            className="p-2 rounded-lg text-[#9ca3af] hover:text-[#e8e3f0] hover:bg-white/[0.06] transition-all border-none bg-transparent cursor-pointer"
            title="Filter orders"
          >
            <FiFilter className="w-4 h-4" />
          </button>
        </div>

        {/* Orders table */}
        <div className="overflow-x-auto -mx-2">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["ORDER ID", "CUSTOMER", "PRODUCT", "AMOUNT", "STATUS", "ACTION"].map((col) => (
                  <th
                    key={col}
                    className="text-left text-[10px] font-bold tracking-[0.12em] text-[#6b7280] pb-3 px-2 first:pl-3"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_ORDERS.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors group"
                >
                  {/* Order ID */}
                  <td className="py-4 px-2 pl-3">
                    <span className="text-sm font-bold text-[#c8b7ff]">{order.id}</span>
                  </td>

                  {/* Customer */}
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        style={{ backgroundColor: order.customer.color }}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-extrabold shrink-0"
                      >
                        {order.customer.initials}
                      </span>
                      <span className="text-sm font-semibold text-[#e8e3f0] whitespace-nowrap">
                        {order.customer.name}
                      </span>
                    </div>
                  </td>

                  {/* Product */}
                  <td className="py-4 px-2">
                    <span className="text-sm text-[#9ca3af]">{order.product}</span>
                  </td>

                  {/* Amount */}
                  <td className="py-4 px-2">
                    <span className="text-sm font-bold text-white">{order.amount}</span>
                  </td>

                  {/* Status badge */}
                  <td className="py-4 px-2">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-[0.08em] uppercase border ${order.statusColor}`}
                    >
                      {order.status}
                    </span>
                  </td>

                  {/* Action menu */}
                  <td className="py-4 px-2 relative">
                    <button
                      onClick={() => setOrderActionMenu(orderActionMenu === order.id ? null : order.id)}
                      className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#e8e3f0] hover:bg-white/[0.08] transition-all border-none bg-transparent cursor-pointer"
                      aria-label="Order actions"
                    >
                      <FiMoreVertical className="w-4 h-4" />
                    </button>

                    {/* Tiny action dropdown */}
                    {orderActionMenu === order.id && (
                      <div className="absolute right-8 top-3 z-20 w-[140px] bg-[#252532] border border-white/[0.08] rounded-xl shadow-xl py-1">
                        {["View Details", "Update Status", "Print Invoice"].map((action) => (
                          <button
                            key={action}
                            onClick={() => {
                              setOrderActionMenu(null);
                            }}
                            className="w-full text-left text-xs font-semibold text-[#9ca3af] hover:text-[#e8e3f0] hover:bg-white/[0.06] px-3 py-2 border-none bg-transparent cursor-pointer transition-colors"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/[0.06]">
          <span className="text-xs text-[#6b7280]">
            Showing 5 of 1,240 orders
          </span>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-[#7c5cbf] hover:text-[#c8b7ff] transition-colors no-underline"
          >
            View All Orders →
          </Link>
        </div>
      </div>
    </div>
  );
}
