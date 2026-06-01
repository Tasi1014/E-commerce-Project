/**
 * AdminCustomers.jsx
 * ─────────────────────────────────────────────
 * Customer management page — static data for now.
 *
 * TODO (Backend integration):
 *   - Fetch customers: GET /api/admin/customers?page=X&limit=10&search=X
 *   - View customer:   GET /api/admin/customers/:id
 *   - Ban/unban:       PATCH /api/admin/customers/:id/status
 */

import { useState } from "react";
import {
  FiSearch, FiMoreVertical, FiUsers,
  FiShoppingBag, FiHeart, FiMail
} from "react-icons/fi";
import { toast } from "sonner";

const CUSTOMERS = [
  { id: 1, name: "John Dorsey",   email: "john.d@email.com",   joined: "Jan 12, 2026", orders: 14, spent: "$2,340.00", status: "Active",   initials: "JD", color: "#4f378a" },
  { id: 2, name: "Sarah Miller",  email: "sarah.m@email.com",  joined: "Feb 4, 2026",  orders: 8,  spent: "$1,120.00", status: "Active",   initials: "SM", color: "#c2410c" },
  { id: 3, name: "Robert King",   email: "robert.k@email.com", joined: "Mar 19, 2026", orders: 22, spent: "$5,800.00", status: "Active",   initials: "RK", color: "#0369a1" },
  { id: 4, name: "Emily Watson",  email: "emily.w@email.com",  joined: "Apr 1, 2026",  orders: 3,  spent: "$340.00",  status: "Active",   initials: "EW", color: "#7c3aed" },
  { id: 5, name: "Marcus Lee",    email: "marcus.l@email.com", joined: "Apr 22, 2026", orders: 1,  spent: "$89.00",   status: "Inactive", initials: "ML", color: "#065f46" },
  { id: 6, name: "Priya Sharma",  email: "priya.s@email.com",  joined: "May 3, 2026",  orders: 7,  spent: "$890.00",  status: "Active",   initials: "PS", color: "#b45309" },
  { id: 7, name: "James Okafor",  email: "james.o@email.com",  joined: "May 10, 2026", orders: 5,  spent: "$660.00",  status: "Active",   initials: "JO", color: "#1d4ed8" },
  { id: 8, name: "Lena Fischer",  email: "lena.f@email.com",   joined: "May 18, 2026", orders: 2,  spent: "$410.00",  status: "Banned",   initials: "LF", color: "#be185d" },
  { id: 9, name: "Carlos Ruiz",   email: "carlos.r@email.com", joined: "May 22, 2026", orders: 4,  spent: "$940.00",  status: "Active",   initials: "CR", color: "#047857" },
  { id:10, name: "Aisha Patel",   email: "aisha.p@email.com",  joined: "May 28, 2026", orders: 1,  spent: "$249.00",  status: "Active",   initials: "AP", color: "#6d28d9" },
];

const STATUS_STYLES = {
  Active:   "text-[#34d399] bg-[#34d399]/10 border-[#34d399]/20",
  Inactive: "text-[#6b7280] bg-white/[0.05] border-white/[0.08]",
  Banned:   "text-[#f87171] bg-[#f87171]/10 border-[#f87171]/20",
};

const CUSTOMER_STATS = [
  { label: "Total Customers", value: "1,840", icon: FiUsers,       color: "#7c5cbf" },
  { label: "Active",          value: "1,712", icon: FiShoppingBag, color: "#34d399" },
  { label: "New This Month",  value: "85",    icon: FiHeart,       color: "#fb923c" },
  { label: "Avg. Order Value",value: "$284",  icon: FiMail,        color: "#22d3ee" },
];

export default function AdminCustomers() {
  const [search, setSearch]   = useState("");
  const [menuOpen, setMenuOpen] = useState(null);

  const filtered = CUSTOMERS.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-[#e8e3f0]">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Customers</h1>
        <p className="text-sm text-[#9ca3af] mt-0.5">View and manage your customer base</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {CUSTOMER_STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-[#1a1a24] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#6b7280]">{stat.label}</p>
                <p className="text-xl font-extrabold text-white mt-0.5">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="bg-[#1a1a24] border border-white/[0.06] rounded-2xl p-4">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm text-[#e8e3f0] placeholder-[#6b7280] outline-none focus:border-[#7c5cbf]/60 transition-all"
          />
        </div>
      </div>

      {/* Customers table */}
      <div className="bg-[#1a1a24] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["CUSTOMER", "EMAIL", "JOINED", "ORDERS", "TOTAL SPENT", "STATUS", "ACTIONS"].map((col) => (
                  <th key={col} className="text-left text-[10px] font-bold tracking-[0.12em] text-[#6b7280] py-4 px-4 first:pl-6">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors group">
                  {/* Customer */}
                  <td className="py-4 px-4 pl-6">
                    <div className="flex items-center gap-3">
                      <span
                        style={{ backgroundColor: c.color }}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-extrabold shrink-0"
                      >
                        {c.initials}
                      </span>
                      <span className="text-sm font-bold text-[#e8e3f0] group-hover:text-white transition-colors whitespace-nowrap">
                        {c.name}
                      </span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-4 px-4">
                    <span className="text-sm text-[#9ca3af]">{c.email}</span>
                  </td>

                  {/* Joined */}
                  <td className="py-4 px-4">
                    <span className="text-xs text-[#6b7280]">{c.joined}</span>
                  </td>

                  {/* Orders count */}
                  <td className="py-4 px-4">
                    <span className="text-sm font-bold text-white">{c.orders}</span>
                  </td>

                  {/* Spent */}
                  <td className="py-4 px-4">
                    <span className="text-sm font-bold text-[#c8b7ff]">{c.spent}</span>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-[0.08em] uppercase border ${STATUS_STYLES[c.status]}`}>
                      {c.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === c.id ? null : c.id)}
                      className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#e8e3f0] hover:bg-white/[0.08] transition-all border-none bg-transparent cursor-pointer"
                    >
                      <FiMoreVertical className="w-4 h-4" />
                    </button>
                    {menuOpen === c.id && (
                      <div className="absolute right-8 top-3 z-20 w-[160px] bg-[#252532] border border-white/[0.08] rounded-xl shadow-xl py-1">
                        {["View Profile", "View Orders", "Send Email", c.status === "Banned" ? "Unban Customer" : "Ban Customer"].map((action) => (
                          <button
                            key={action}
                            onClick={() => { setMenuOpen(null); toast.info(`${action} — coming with backend integration`); }}
                            className={`w-full text-left text-xs font-semibold px-3 py-2 border-none bg-transparent cursor-pointer transition-colors ${
                              action.includes("Ban") && !action.includes("Unban")
                                ? "text-[#f87171] hover:bg-[#f87171]/10"
                                : "text-[#9ca3af] hover:text-[#e8e3f0] hover:bg-white/[0.06]"
                            }`}
                          >
                            {action}
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
                    <FiUsers className="w-8 h-8 mx-auto mb-3 opacity-40" />
                    No customers match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-white/[0.06]">
          <span className="text-xs text-[#6b7280]">Showing {filtered.length} of {CUSTOMERS.length} customers</span>
          <div className="flex gap-1">
            {[1, 2, 3].map((p) => (
              <button key={p} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${p === 1 ? "bg-[#4f378a] text-white" : "bg-white/[0.06] text-[#9ca3af] hover:bg-white/[0.1]"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
