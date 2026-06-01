/**
 * AdminProducts.jsx
 * ─────────────────────────────────────────────
 * Product management page — static data for now.
 *
 * TODO (Backend integration):
 *   - Fetch products: GET /api/admin/products?page=X&limit=10&search=X&category=X
 *   - Add product:    POST /api/admin/products
 *   - Update product: PUT  /api/admin/products/:id
 *   - Delete product: DELETE /api/admin/products/:id
 *   - Replace local state with React Query or SWR
 */

import { useState } from "react";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiMoreVertical, FiPackage } from "react-icons/fi";
import { toast } from "sonner";

const MOCK_PRODUCTS = [
  { id: 1, name: "Phantom X Watch",      category: "Electronics", price: "$599.00", stock: 42,  status: "Active",   img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=60&h=60&fit=crop" },
  { id: 2, name: "Sonic Core Pro",       category: "Audio",       price: "$249.00", stock: 18,  status: "Active",   img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=60&h=60&fit=crop" },
  { id: 3, name: "Vertex Chrono",        category: "Fashion",     price: "$1,200.00",stock: 7, status: "Low Stock",img: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=60&h=60&fit=crop" },
  { id: 4, name: "Summit Leather Jacket",category: "Apparel",     price: "$340.00", stock: 55,  status: "Active",   img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=60&h=60&fit=crop" },
  { id: 5, name: "Horizon Sunglasses",   category: "Accessories", price: "$89.00",  stock: 0,   status: "Out of Stock",img:"https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=60&h=60&fit=crop"},
  { id: 6, name: "Classic Polo Shirt",   category: "Apparel",     price: "$120.00", stock: 130, status: "Active",   img: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=60&h=60&fit=crop" },
  { id: 7, name: "Eclipse Frames",       category: "Accessories", price: "$220.00", stock: 3,   status: "Low Stock",img: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=60&h=60&fit=crop" },
  { id: 8, name: "Urban Slide Sneakers", category: "Footwear",    price: "$190.00", stock: 88,  status: "Active",   img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=60&h=60&fit=crop" },
];

const STATUS_STYLES = {
  "Active":       "text-[#34d399] bg-[#34d399]/10 border-[#34d399]/20",
  "Low Stock":    "text-[#fb923c] bg-[#fb923c]/10 border-[#fb923c]/20",
  "Out of Stock": "text-[#f87171] bg-[#f87171]/10 border-[#f87171]/20",
};

export default function AdminProducts() {
  const [search, setSearch]   = useState("");
  const [menuOpen, setMenuOpen] = useState(null);

  const filtered = MOCK_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-[#e8e3f0]">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Products</h1>
          <p className="text-sm text-[#9ca3af] mt-0.5">{MOCK_PRODUCTS.length} products total</p>
        </div>
        <button
          onClick={() => toast.info("Add product form — coming with backend integration")}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#4f378a] hover:bg-[#5f479a] text-white text-sm font-bold rounded-xl transition-all cursor-pointer border-none shadow-[0_4px_14px_rgba(79,55,138,0.4)]"
        >
          <FiPlus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Search + filter bar */}
      <div className="bg-[#1a1a24] border border-white/[0.06] rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm text-[#e8e3f0] placeholder-[#6b7280] outline-none focus:border-[#7c5cbf]/60 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Products table */}
      <div className="bg-[#1a1a24] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["PRODUCT", "CATEGORY", "PRICE", "STOCK", "STATUS", "ACTIONS"].map((col) => (
                  <th key={col} className="text-left text-[10px] font-bold tracking-[0.12em] text-[#6b7280] py-4 px-4 first:pl-6">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors group">
                  {/* Product */}
                  <td className="py-4 px-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#252532] border border-white/[0.08] shrink-0">
                        <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-sm font-bold text-[#e8e3f0] group-hover:text-white transition-colors">
                        {product.name}
                      </span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-4 px-4">
                    <span className="text-sm text-[#9ca3af]">{product.category}</span>
                  </td>

                  {/* Price */}
                  <td className="py-4 px-4">
                    <span className="text-sm font-bold text-white">{product.price}</span>
                  </td>

                  {/* Stock */}
                  <td className="py-4 px-4">
                    <span className={`text-sm font-semibold ${product.stock === 0 ? "text-[#f87171]" : product.stock < 10 ? "text-[#fb923c]" : "text-[#9ca3af]"}`}>
                      {product.stock}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-[0.08em] uppercase border ${STATUS_STYLES[product.status]}`}>
                      {product.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 relative">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toast.info("Edit product — coming with backend integration")}
                        className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#7c5cbf] hover:bg-[#7c5cbf]/10 transition-all border-none bg-transparent cursor-pointer"
                        title="Edit"
                      >
                        <FiEdit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toast.error("Delete product — coming with backend integration")}
                        className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#f87171] hover:bg-[#f87171]/10 transition-all border-none bg-transparent cursor-pointer"
                        title="Delete"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-[#6b7280] text-sm">
                    <FiPackage className="w-8 h-8 mx-auto mb-3 opacity-40" />
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination placeholder */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-white/[0.06]">
          <span className="text-xs text-[#6b7280]">Showing {filtered.length} of {MOCK_PRODUCTS.length} products</span>
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
