import { useState, useEffect } from "react";
import { FiSearch, FiRefreshCw, FiMapPin } from "react-icons/fi";
import { toast } from "sonner";
import axiosInstance from "../../api/axiosInstance";
import DataTable from "../../Components/UI/DataTable";

const STATUS_STYLES = {
  Pending: "text-amber-600 dark:text-[#ffb95f] bg-amber-500/10 border-amber-500/20",
  Processing: "text-blue-600 dark:text-[#60a5fa] bg-blue-500/10 border-blue-500/20",
  Shipped: "text-purple-600 dark:text-[#c084fc] bg-purple-500/10 border-purple-500/20",
  Delivered: "text-emerald-600 dark:text-[#4edea3] bg-emerald-500/10 border-emerald-500/20",
  Cancelled: "text-red-600 dark:text-[#ffb4ab] bg-red-500/10 border-red-500/20",
};

const STATUSES = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const limit = 5;
  const [stats, setStats] = useState({
    totalCount: 0,
    pendingCount: 0,
    processingCount: 0,
    deliveredCount: 0,
  });

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchOrders = async (showToast = false) => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/admin/orders", {
        params: {
          page: currentPage,
          limit,
          search: debouncedSearch,
          status: statusFilter,
        },
      });
      if (res.data.success) {
        setOrders(res.data.orders);
        setTotalPages(res.data.pagination.totalPages);
        setTotalOrders(res.data.pagination.totalOrders);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
        if (showToast) {
          toast.success("Orders list updated successfully");
        }
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      toast.error(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, debouncedSearch, statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await axiosInstance.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders();
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error(err.response?.data?.message || "Failed to update status");
      fetchOrders();
    }
  };

  const handleStatusFilterChange = (newStatus) => {
    setStatus(newStatus);
    setCurrentPage(1);
  };

  const ORDER_STATS = [
    { label: "Total", value: stats.totalCount, accentColor: "bg-[#7c3aed] dark:bg-[#d0bcff]" },
    { label: "Pending", value: stats.pendingCount, accentColor: "bg-amber-500" },
    { label: "Processing", value: stats.processingCount, accentColor: "bg-blue-500" },
    { label: "Delivered", value: stats.deliveredCount, accentColor: "bg-emerald-500" },
  ];

  const columns = [
    {
      key: "_id",
      label: "ORDER ID",
      render: (val) => (
        <span className="text-sm font-bold text-[#7c3aed] dark:text-[#c8b7ff]">
          #{val.slice(-8).toUpperCase()}
        </span>
      ),
    },
    {
      key: "user",
      label: "CUSTOMER",
      render: (val) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 dark:text-[#e8e3f0]">{val?.name || "Guest"}</span>
          <span className="text-xs text-slate-500 dark:text-[#9ca3af]">{val?.email || "No email"}</span>
        </div>
      ),
    },
    {
      key: "totalAmount",
      label: "TOTAL",
      render: (val) => (
        <span className="font-extrabold text-slate-900 dark:text-white">${val.toFixed(2)}</span>
      ),
    },
    {
      key: "orderStatus",
      label: "STATUS",
      render: (val) => (
        <span
          className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase border ${
            STATUS_STYLES[val] || STATUS_STYLES.Pending
          }`}
        >
          {val}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "DATE",
      render: (val) => (
        <span className="text-xs text-slate-500 dark:text-[#9ca3af] font-semibold">
          {new Date(val).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
        </span>
      ),
    },
    {
      key: "actions",
      label: "UPDATE STATUS",
      render: (_, row) => (
        <select
          value={row.orderStatus}
          onChange={(e) => handleStatusChange(row._id, e.target.value)}
          className="text-xs font-bold bg-white dark:bg-[#1e1e2a] text-slate-900 dark:text-[#e8e3f0] border border-slate-200 dark:border-white/10 focus:ring-1 focus:ring-[#7c3aed] rounded-xl px-2.5 py-1.5 outline-none cursor-pointer shadow-2xs"
        >
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      ),
    },
    {
      key: "address",
      label: "ADDRESS",
      render: (val, row) => (
        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-600 dark:text-[#9ca3af]">{val || "—"}</span>
          {row.location?.lat && row.location?.lng && (
            <a
              href={`https://www.openstreetmap.org/?mlat=${row.location.lat}&mlon=${row.location.lng}#map=17/${row.location.lat}/${row.location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#7c3aed] dark:text-[#d0bcff] text-xs flex items-center gap-1 hover:underline font-semibold"
            >
              <FiMapPin size={12} />
              View on map
            </a>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-slate-800 dark:text-[#e8e3f0]">
      {/* Page Header (Matching Stitch Design) */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Orders
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#9ca3af] mt-1">
            Manage and track all customer orders
          </p>
        </div>
        <button
          onClick={() => fetchOrders(true)}
          className="w-10 h-10 rounded-full bg-white dark:bg-[#1b1b1d] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-[#2a2a2c] transition-colors shadow-xs cursor-pointer"
          title="Refresh orders"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#7c3aed]" : ""}`} />
        </button>
      </div>

      {/* Metrics Cards Grid (Matching Stitch Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {ORDER_STATS.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-[#1b1b1d] border border-slate-200 dark:border-white/10 rounded-2xl p-4 relative overflow-hidden shadow-xs flex flex-col justify-between"
          >
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-[#9ca3af]">
              {stat.label}
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {stat.value}
            </p>
            <div className={`h-1 w-8 rounded-full mt-2 ${stat.accentColor}`} />
          </div>
        ))}
      </div>

      {/* Search Bar + Filter Pills */}
      <div className="bg-white dark:bg-[#1b1b1d] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="relative w-full">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-[#9ca3af]" />
          <input
            type="text"
            placeholder="Search by order ID or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-[#e8e3f0] placeholder:text-slate-400 dark:placeholder:text-[#9ca3af] outline-none focus:ring-2 focus:ring-[#7c3aed] dark:focus:ring-[#d0bcff] transition-all"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => handleStatusFilterChange(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border cursor-pointer transition-all ${
                statusFilter === s
                  ? "bg-[#7c3aed] dark:bg-[#d0bcff] text-white dark:text-[#131315] border-[#7c3aed] dark:border-[#d0bcff] shadow-xs"
                  : "bg-white dark:bg-[#1b1b1d] border-slate-200 dark:border-white/10 text-slate-600 dark:text-[#9ca3af] hover:bg-slate-50 dark:hover:bg-white/10"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Orders Cards View (< 768px) */}
      <div className="block md:hidden space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#1b1b1d] border border-slate-200 dark:border-white/10 p-4 rounded-2xl animate-pulse space-y-3"
            >
              <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-1/3"></div>
              <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-1/2"></div>
            </div>
          ))
        ) : orders.length === 0 ? (
          <div className="bg-white dark:bg-[#1b1b1d] border border-slate-200 dark:border-white/10 rounded-2xl p-8 text-center text-slate-400 dark:text-[#6b7280] text-sm">
            No orders found matching your search.
          </div>
        ) : (
          orders.map((ord) => (
            <div
              key={ord._id}
              className="bg-white dark:bg-[#1b1b1d] border border-slate-200 dark:border-white/10 p-4 rounded-2xl shadow-xs space-y-3"
            >
              {/* Order Header */}
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[#7c3aed] dark:text-[#c8b7ff] font-bold text-sm">
                    #{ord._id.slice(-8).toUpperCase()}
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base mt-0.5">
                    {ord.user?.name || "Guest"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#9ca3af]">{ord.user?.email || "No email"}</p>
                </div>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                    STATUS_STYLES[ord.orderStatus] || STATUS_STYLES.Pending
                  }`}
                >
                  {ord.orderStatus}
                </span>
              </div>

              {/* Order Footer & Actions */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-white/10 text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 dark:text-[#9ca3af] uppercase font-bold">
                    Total Amount
                  </p>
                  <p className="font-extrabold text-slate-900 dark:text-white text-base">
                    ${ord.totalAmount?.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 dark:text-[#9ca3af] uppercase font-bold">
                    Order Date
                  </p>
                  <p className="text-xs font-semibold text-slate-700 dark:text-[#e8e3f0]">
                    {new Date(ord.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Address / Map & Status Select */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/10 text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-slate-400 dark:text-[#9ca3af] uppercase font-bold">
                    Shipping Address
                  </span>
                  <span className="text-slate-700 dark:text-[#e8e3f0] font-medium">
                    {ord.address || "—"}
                  </span>
                  {ord.location?.lat && ord.location?.lng && (
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${ord.location.lat}&mlon=${ord.location.lng}#map=17/${ord.location.lat}/${ord.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#7c3aed] dark:text-[#d0bcff] text-xs flex items-center gap-1 hover:underline font-bold mt-0.5"
                    >
                      <FiMapPin size={12} />
                      View location map
                    </a>
                  )}
                </div>

                <div className="w-full sm:w-auto mt-1 sm:mt-0">
                  <select
                    value={ord.orderStatus}
                    onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                    className="w-full text-xs font-bold bg-slate-50 dark:bg-[#1e1e2a] text-slate-900 dark:text-[#e8e3f0] border border-slate-200 dark:border-white/10 focus:ring-1 focus:ring-[#7c3aed] rounded-xl px-3 py-2 outline-none cursor-pointer shadow-2xs"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Orders Table View (>= 768px) */}
      <div className="hidden md:block">
        <DataTable
          columns={columns}
          data={orders}
          loading={loading}
          emptyMessage="No orders found matching your search."
        />
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-white/10 pt-4 px-1">
          <div className="text-xs text-slate-500 dark:text-[#9ca3af]">
            Showing{" "}
            <span className="font-bold text-slate-900 dark:text-white">
              {Math.min((currentPage - 1) * limit + 1, totalOrders)}
            </span>{" "}
            to{" "}
            <span className="font-bold text-slate-900 dark:text-white">
              {Math.min(currentPage * limit, totalOrders)}
            </span>{" "}
            of <span className="font-bold text-slate-900 dark:text-white">{totalOrders}</span> entries
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
    </div>
  );
}