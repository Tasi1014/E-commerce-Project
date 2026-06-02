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
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async (showToast = false) => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/admin/products");
      if (res.data.success) {
        setProducts(res.data.products);
        if (showToast) {
          toast.success("Products directory refreshed successfully");
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
  }, []);

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await axiosInstance.delete(`/admin/products/${productId}`);
      if (res.data.success) {
        toast.success("Product deleted successfully");
        setProducts((prev) => prev.filter((p) => p._id !== productId));
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      toast.error(err.response?.data?.message || "Failed to delete product");
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: "name",
      label: "PRODUCT",
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#252532] border border-white/[0.08] shrink-0">
            <img
              src={row.mainImage || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=60&h=60&fit=crop"}
              alt={val}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-sm font-bold text-[#e8e3f0] group-hover:text-white transition-colors">
            {val}
          </span>
        </div>
      ),
    },
    {
      key: "category",
      label: "CATEGORY",
      render: (val) => <span className="text-sm text-[#9ca3af]">{val}</span>,
    },
    {
      key: "price",
      label: "PRICE",
      render: (val) => <span className="text-sm font-bold text-white">${val.toFixed(2)}</span>,
    },
    {
      key: "stock",
      label: "STOCK",
      render: (val) => (
        <span
          className={`text-sm font-semibold ${
            val === 0 ? "text-[#f87171]" : val < 10 ? "text-[#fb923c]" : "text-[#9ca3af]"
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
        let style = "text-[#34d399] bg-[#34d399]/10 border-[#34d399]/20";
        if (row.stock === 0) {
          status = "Out of Stock";
          style = "text-[#f87171] bg-[#f87171]/10 border-[#f87171]/20";
        } else if (row.stock < 10) {
          status = "Low Stock";
          style = "text-[#fb923c] bg-[#fb923c]/10 border-[#fb923c]/20";
        }
        return (
          <span
            className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-[0.08em] uppercase border ${style}`}
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
            className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#7c5cbf] hover:bg-[#7c5cbf]/10 transition-all border-none bg-transparent cursor-pointer"
            title="Edit"
          >
            <FiEdit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDeleteProduct(row._id)}
            className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#f87171] hover:bg-[#f87171]/10 transition-all border-none bg-transparent cursor-pointer"
            title="Delete"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-[#e8e3f0]">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Products</h1>
          <p className="text-sm text-[#9ca3af] mt-0.5">{products.length} products total</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchProducts(true)}
            className="p-2.5 rounded-xl text-[#9ca3af] hover:text-[#e8e3f0] hover:bg-white/[0.06] transition-all border-none bg-transparent cursor-pointer"
            title="Refresh Products"
          >
            <FiRefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => {
              setEditingProduct(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#4f378a] hover:bg-[#5f479a] text-white text-sm font-bold rounded-xl transition-all cursor-pointer border-none shadow-[0_4px_14px_rgba(79,55,138,0.4)] animate-hover hover:scale-105 duration-300"
          >
            <FiPlus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Search + filter bar (individual page search bar) */}
      <div className="bg-[#1a1a24] border border-white/[0.06] rounded-2xl p-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
          <input
            type="text"
            placeholder="Search products by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm text-[#e8e3f0] placeholder-[#6b7280] outline-none focus:border-[#7c5cbf]/60 transition-all"
          />
        </div>
      </div>

      {/* Products table container utilizing custom Dark DataTable */}
      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        emptyMessage="No products found in the catalog matching your query."
      />

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
