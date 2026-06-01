/**
 * AdminOrders.jsx
 * ─────────────────────────────────────────────
 * Order management page — static data for now.
 *
 * TODO (Backend integration):
 *   - Fetch orders:   GET /api/admin/orders?page=X&limit=10&status=X&search=X
 *   - Update status:  PATCH /api/admin/orders/:id/status
 *   - View details:   GET /api/admin/orders/:id
 */

import { useState } from "react";
import { FiSearch, FiFilter, FiMoreVertical, FiShoppingCart, FiChevronDown } from "react-icons/fi";
import { toast } from "sonner";

const ALL_ORDERS = [
  { id: "#PK-9401", customer: { name: "John Dorsey",   initials: "JD", color: "#4f378a" }, product: "Phantom X Watch",      amount: "$599.00",  date: "May 30, 2026", status: "Shipped" },
  { id: "#PK-9402", customer: { name: "Sarah Miller",  initials: "SM", color: "#c2410c" }, product: "Sonic Core Pro",       amount: "$249.00",  date: "May 30, 2026", status: "Processing" },
  { id: "#PK-9403", customer: { name: "Robert King",   initials: "RK", color: "#0369a1" }, product: "Vertex Chrono",        amount: "$1,200.00", date: "May 29, 2026", status: "Delivered" },
  { id: "#PK-9404", customer: { name: "Emily Watson",  initials: "EW", color: "#7c3aed" }, product: "Summit Leather Jacket",amount: "$340.00",  date: "May 29, 2026", status: "Pending" },
  { id: "#PK-9405", customer: { name: "Marcus Lee",    initials: "ML", color: "#065f46" }, product: "Horizon Sunglasses",   amount: "$89.00",   date: "May 28, 2026", status: "Cancelled" },
  { id: "#PK-9406", customer: { name: "Priya Sharma",  initials: "PS", color: "#b45309" }, product: "Classic Polo Shirt",   amount: "$120.00",  date: "May 28, 2026", status: "Delivered" },
  { id: "#PK-9407", customer: { name: "James Okafor",  initials: "JO", color: "#1d4ed8" }, product: "Eclipse Frames",       amount: "$220.00",  date: "May 27, 2026", status: "Shipped" },
  { id: "#PK-9408", customer: { name: "Lena Fischer",  initials: "LF", color: "#be185d" }, product: "Urban Slide Sneakers", amount: "$190.00",  date: "May 27, 2026", status: "Processing" },
  { id: "#PK-9409", customer: { name: "Carlos Ruiz",   initials: "CR", color: "#047857" }, product: "Phantom X Watch",      amount: "$599.00",  date: "May 26, 2026", status: "Pending" },
  { id: "#PK-9410", customer: { name: "Aisha Patel",   initials: "AP", color: "#6d28d9" }, product: "Sonic Core Pro",       amount: "$249.00",  date: "May 26, 2026", status: "Delivered" },
];

const STATUS_STYLES = {
  Shipped:    "text-[#34d399] bg-[#34d399]/10 border-[#34d399]/20",
  Processing: "text-[#fb923c] bg-[#fb923c]/10 border-[#fb923c]/20",
  Delivered:  "text-[#22d3ee] bg-[#22d3ee]/10 border-[#22d3ee]/20",
  Pending:    "text-[#facc15] bg-[#facc15]/10 border-[#facc15]/20",
  Cancelled:  "text-[#f87171] bg-[#f87171]/10 border-[#f87171]/20",
};

const STATUSES = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

/* Summary stats */
const ORDER_STATS = [
  { label: "Total Orders",    value: "1,240", color: "#7c5cbf" },
  { label: "Pending",         value: "84",    color: "#facc15" },
  { label: "Processing",      value: "213",   color: "#fb923c" },
  { label: "Delivered",       value: "891",   color: "#22d3ee" },
];

export default function AdminOrders() {
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("All");
  const [menuOpen, setMenuOpen]     = useState(null);

  const filtered = ALL_ORDERS.filter((o) => {
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      o.product.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 text-[#e8e3f0]">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Orders</h1>
        <p className="text-sm text-[#9ca3af] mt-0.5">Manage and track all customer orders</p>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {ORDER_STATS.map((stat) => (
          <div key={stat.label} className="bg-[#1a1a24] border border-white/[0.06] rounded-2xl p-4">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#6b7280]">{stat.label}</p>
            <p className="text-2xl font-extrabold text-white mt-2">{stat.value}</p>
            <div className="mt-2 h-0.5 w-8 rounded-full" style={{ backgroundColor: stat.color }} />
          </div>
        ))}
      </div>

      {/* Search + filter bar */}
      <div className="bg-[#1a1a24] border border-white/[0.06] rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
            <input
              type="text"
              placeholder="Search by order ID, customer, or product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm text-[#e8e3f0] placeholder-[#6b7280] outline-none focus:border-[#7c5cbf]/60 transition-all"
            />
          </div>

          {/* Status filter pills */}
          <div className="flex flex-wrap gap-1.5">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  statusFilter === s
                    ? "bg-[#4f378a] text-white shadow-[0_2px_8px_rgba(79,55,138,0.4)]"
                    : "bg-white/[0.06] text-[#9ca3af] hover:bg-white/[0.1] hover:text-[#e8e3f0]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-[#1a1a24] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["ORDER ID", "CUSTOMER", "PRODUCT", "DATE", "AMOUNT", "STATUS", "ACTIONS"].map((col) => (
                  <th key={col} className="text-left text-[10px] font-bold tracking-[0.12em] text-[#6b7280] py-4 px-4 first:pl-6">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors group">
                  {/* Order ID */}
                  <td className="py-4 px-4 pl-6">
                    <span className="text-sm font-bold text-[#c8b7ff]">{order.id}</span>
                  </td>

                  {/* Customer */}
                  <td className="py-4 px-4">
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
                  <td className="py-4 px-4">
                    <span className="text-sm text-[#9ca3af]">{order.product}</span>
                  </td>

                  {/* Date */}
                  <td className="py-4 px-4">
                    <span className="text-xs text-[#6b7280]">{order.date}</span>
                  </td>

                  {/* Amount */}
                  <td className="py-4 px-4">
                    <span className="text-sm font-bold text-white">{order.amount}</span>
                  </td>

                  {/* Status badge */}
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-[0.08em] uppercase border ${STATUS_STYLES[order.status]}`}>
                      {order.status}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-4 px-4 relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === order.id ? null : order.id)}
                      className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#e8e3f0] hover:bg-white/[0.08] transition-all border-none bg-transparent cursor-pointer"
                    >
                      <FiMoreVertical className="w-4 h-4" />
                    </button>
                    {menuOpen === order.id && (
                      <div className="absolute right-8 top-3 z-20 w-[150px] bg-[#252532] border border-white/[0.08] rounded-xl shadow-xl py-1">
                        {["View Details", "Update Status", "Print Invoice", "Cancel Order"].map((a) => (
                          <button
                            key={a}
                            onClick={() => { setMenuOpen(null); toast.info(`${a} — coming with backend integration`); }}
                            className="w-full text-left text-xs font-semibold text-[#9ca3af] hover:text-[#e8e3f0] hover:bg-white/[0.06] px-3 py-2 border-none bg-transparent cursor-pointer transition-colors"
                          >
                            {a}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-[#6b7280] text-sm">
                    <FiShoppingCart className="w-8 h-8 mx-auto mb-3 opacity-40" />
                    No orders match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination placeholder */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-white/[0.06]">
          <span className="text-xs text-[#6b7280]">Showing {filtered.length} of {ALL_ORDERS.length} orders</span>
          <div className="flex gap-1">
            {[1, 2, 3, "...", 12].map((p, i) => (
              <button key={i} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${p === 1 ? "bg-[#4f378a] text-white" : "bg-white/[0.06] text-[#9ca3af] hover:bg-white/[0.1]"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
