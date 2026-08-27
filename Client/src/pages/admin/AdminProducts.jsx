import { useState, useEffect } from "react";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiRefreshCw } from "react-icons/fi";
import { toast } from "sonner";
import axiosInstance from "../../api/axiosInstance";
import DataTable from "../../Components/UI/DataTable";
import ProductFormModal from "./ProductFormModal";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 5;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchProducts = async (showToast = false) => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/admin/products", {
        params: {
          page: currentPage,
          limit,
          search: debouncedSearch,
        },
      });
      if (res.data.success) {
        setProducts(res.data.products);
        setTotalPages(res.data.pagination.totalPages);
        setTotalProducts(res.data.pagination.totalProducts);
        if (showToast) {
          toast.success("Products catalog refreshed successfully");
        }
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      toast.error(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, debouncedSearch]);

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await axiosInstance.delete(`/admin/products/${productId}`);
      if (res.data.success) {
        toast.success("Product deleted successfully");
        fetchProducts();
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      toast.error(err.response?.data?.message || "Failed to delete product");
    }
  };

  const columns = [
    {
      key: "name",
      label: "PRODUCT",
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-[#252532] border border-slate-200 dark:border-white/10 shrink-0">
            <img
              src={row.mainImage || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=60&h=60&fit=crop"}
              alt={val}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-sm font-bold text-slate-800 dark:text-[#e8e3f0] group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
            {val}
          </span>
        </div>
      ),
    },
    {
      key: "category",
      label: "CATEGORY",
      render: (val) => <span className="text-sm text-slate-500 dark:text-[#9ca3af]">{val}</span>,
    },
    {
      key: "price",
      label: "PRICE",
      render: (val) => (
        <span className="text-sm font-bold text-slate-900 dark:text-white">${val.toFixed(2)}</span>
      ),
    },
    {
      key: "stock",
      label: "STOCK",
      render: (val) => (
        <span
          className={`text-sm font-semibold ${
            val === 0
              ? "text-red-500 dark:text-[#ffb4ab]"
              : val < 10
              ? "text-amber-500 dark:text-[#ffb95f]"
              : "text-slate-600 dark:text-[#9ca3af]"
          }`}
        >
          {val}
        </span>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      render: (_, row) => {
        let status = "Active";
        let style = "text-emerald-600 dark:text-[#4edea3] bg-emerald-500/10 border-emerald-500/20";
        if (row.stock === 0) {
          status = "Out of Stock";
          style = "text-red-500 dark:text-[#ffb4ab] bg-red-500/10 border-red-500/20";
        } else if (row.stock < 10) {
          status = "Low Stock";
          style = "text-amber-500 dark:text-[#ffb95f] bg-amber-500/10 border-amber-500/20";
        }
        return (
          <span
            className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase border ${style}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "ACTIONS",
      render: (_, row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              setEditingProduct(row);
              setModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#7c3aed] dark:hover:text-[#d0bcff] hover:bg-slate-100 dark:hover:bg-white/10 transition-all border-none bg-transparent cursor-pointer"
            title="Edit"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteProduct(row._id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 dark:hover:text-[#ffb4ab] hover:bg-red-50 dark:hover:bg-red-500/10 transition-all border-none bg-transparent cursor-pointer"
            title="Delete"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-slate-800 dark:text-[#e8e3f0]">
      {/* Page Header (Matching Stitch Design) */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Products
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#9ca3af] mt-1">
            {totalProducts} products total in catalog
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchProducts(true)}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#1b1b1d] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-[#2a2a2c] transition-colors shadow-xs cursor-pointer"
            title="Refresh Products"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#7c3aed]" : ""}`} />
          </button>
          <button
            onClick={() => {
              setEditingProduct(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#7c3aed] dark:bg-[#d0bcff] hover:bg-[#6d28d9] dark:hover:bg-[#a078ff] text-white dark:text-[#131315] text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer border-none shadow-md hover:scale-105 duration-200"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative w-full">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-[#9ca3af]" />
        <input
          type="text"
          placeholder="Search products by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-[#1b1b1d] border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-[#e8e3f0] placeholder:text-slate-400 dark:placeholder:text-[#9ca3af] outline-none focus:ring-2 focus:ring-[#7c3aed] dark:focus:ring-[#d0bcff] transition-all shadow-xs"
        />
      </div>

      {/* Mobile Product Cards View (< 768px) */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#1b1b1d] border border-slate-200 dark:border-white/10 p-4 rounded-2xl animate-pulse flex items-center gap-3"
            >
              <div className="w-16 h-16 bg-slate-200 dark:bg-white/10 rounded-xl shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-1/2"></div>
                <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-1/3"></div>
              </div>
            </div>
          ))
        ) : products.length === 0 ? (
          <div className="bg-white dark:bg-[#1b1b1d] border border-slate-200 dark:border-white/10 rounded-2xl p-8 text-center text-slate-400 dark:text-[#6b7280] text-sm">
            No products found matching your search.
          </div>
        ) : (
          products.map((prod) => {
            let statusText = "Active";
            let statusStyle =
              "text-emerald-600 dark:text-[#4edea3] bg-emerald-500/10 border-emerald-500/20";
            if (prod.stock === 0) {
              statusText = "Out of Stock";
              statusStyle = "text-red-500 dark:text-[#ffb4ab] bg-red-500/10 border-red-500/20";
            } else if (prod.stock < 10) {
              statusText = "Low Stock";
              statusStyle = "text-amber-500 dark:text-[#ffb95f] bg-amber-500/10 border-amber-500/20";
            }

            return (
              <div
                key={prod._id}
                className="bg-white dark:bg-[#1b1b1d] border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex items-center gap-3 shadow-xs"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-[#252532] border border-slate-200 dark:border-white/10 shrink-0">
                  <img
                    src={
                      prod.mainImage ||
                      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=60&h=60&fit=crop"
                    }
                    alt={prod.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex flex-col flex-1 min-w-0 gap-1">
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {prod.name}
                    </span>
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase border shrink-0 tracking-wider ${statusStyle}`}
                    >
                      {statusText}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#9ca3af]">
                    <span>{prod.category}</span>
                    <span>•</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      ${prod.price.toFixed(2)}
                    </span>
                    <span>•</span>
                    <span>{prod.stock} in stock</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setEditingProduct(prod);
                      setModalOpen(true);
                    }}
                    className="p-2 rounded-full text-slate-500 dark:text-[#cbc3d7] hover:bg-slate-100 dark:hover:bg-white/10 transition-colors border-none bg-transparent"
                    title="Edit"
                  >
                    <FiEdit2 className="w-4 h-4 text-[#7c3aed] dark:text-[#d0bcff]" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(prod._id)}
                    className="p-2 rounded-full text-slate-500 dark:text-[#cbc3d7] hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border-none bg-transparent"
                    title="Delete"
                  >
                    <FiTrash2 className="w-4 h-4 text-red-500 dark:text-[#ffb4ab]" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Products Table View (>= 768px) */}
      <div className="hidden md:block">
        <DataTable
          columns={columns}
          data={products}
          loading={loading}
          emptyMessage="No products found in the catalog matching your query."
        />
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-white/10 pt-4 px-1">
          <div className="text-xs text-slate-500 dark:text-[#9ca3af]">
            Showing{" "}
            <span className="font-bold text-slate-900 dark:text-white">
              {Math.min((currentPage - 1) * limit + 1, totalProducts)}
            </span>{" "}
            to{" "}
            <span className="font-bold text-slate-900 dark:text-white">
              {Math.min(currentPage * limit, totalProducts)}
            </span>{" "}
            of <span className="font-bold text-slate-900 dark:text-white">{totalProducts}</span> entries
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="px-4 py-2 bg-white dark:bg-[#1b1b1d] hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 dark:border-white/10 text-xs font-bold rounded-full text-slate-900 dark:text-white transition-all cursor-pointer shadow-2xs"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || loading}
              className="px-4 py-2 bg-[#7c3aed] dark:bg-[#d0bcff] hover:bg-[#6d28d9] dark:hover:bg-[#a078ff] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold rounded-full text-white dark:text-[#131315] border-none transition-all cursor-pointer shadow-xs"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <ProductFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProduct(null);
        }}
        onSuccess={() => fetchProducts(false)}
        product={editingProduct}
      />
    </div>
  );
}
