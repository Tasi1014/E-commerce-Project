import { useState, useEffect } from "react";
import { FiSearch, FiRefreshCw } from "react-icons/fi";
import { toast } from "sonner";
import axiosInstance from "../../api/axiosInstance";
import DataTable from "../../Components/UI/DataTable";
import { fetchUserOrders } from '../../api/orderApi';

const STATUS_STYLES = {
  Pending:    "text-[#facc15] bg-[#facc15]/10 border-[#facc15]/20",
  Processing: "text-[#fb923c] bg-[#fb923c]/10 border-[#fb923c]/20",
  Shipped:    "text-[#34d399] bg-[#34d399]/10 border-[#34d399]/20",
  Delivered:  "text-[#22d3ee] bg-[#22d3ee]/10 border-[#22d3ee]/20",
  Cancelled:  "text-[#f87171] bg-[#f87171]/10 border-[#f87171]/20",
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

  // Debounce search query to avoid redundant API requests
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
      const fetchOrders = async () => {
        try {
          const res = await fetchUserOrders();
          setOrders(res.data.orders);
        } catch (err) {
          toast.error('Failed to load orders');
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }, []);

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

  // Refetch when page, search query, or status filter changes
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
    { label: "Total Orders", value: stats.totalCount, color: "#7c5cbf" },
    { label: "Pending", value: stats.pendingCount, color: "#facc15" },
    { label: "Processing", value: stats.processingCount, color: "#fb923c" },
    { label: "Delivered", value: stats.deliveredCount, color: "#22d3ee" },
  ];

  const columns = [
    {
      key: "_id",
      label: "ORDER ID",
      render: (val) => (
        <span className="text-sm font-bold text-[#c8b7ff]">
          #{val.slice(-8).toUpperCase()}
        </span>
      ),
    },
    {
      key: "user",
      label: "CUSTOMER",
      render: (val) => (
        <div className="flex flex-col">
          <span className="font-bold text-[#e8e3f0]">{val?.name || "Anonymous"}</span>
          <span className="text-xs text-[#6b7280]">{val?.email || "No email"}</span>
        </div>
      ),
    },
    {
      key: "totalAmount",
      label: "TOTAL",
      render: (val) => <span className="font-extrabold text-white">${val.toFixed(2)}</span>,
    },
    {
      key: "orderStatus",
      label: "STATUS",
      render: (val) => (
        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-[0.08em] uppercase border ${STATUS_STYLES[val] || STATUS_STYLES.Pending}`}>
          {val}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "DATE",
      render: (val) => (
        <span className="text-xs text-[#6b7280] font-semibold">
          {new Date(val).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
      ),
    },
    {
      key: "actions",
      label: "ACTIONS",
      render: (_, row) => (
        <select
          value={row.orderStatus}
          onChange={(e) => handleStatusChange(row._id, e.target.value)}
          className="text-xs font-bold bg-[#1e1e2a] text-[#e8e3f0] border border-white/[0.08] focus:border-[#7c5cbf]/60 rounded-xl px-2.5 py-1.5 outline-none cursor-pointer transition-all duration-200"
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
      label: "Address",
      render: (val, row) => (
        <div className="flex flex-col gap-1">
          <span className="text-xs text-[#9ca3af]">{val || "—"}</span>
          {row.location?.lat && row.location?.lng && (
            <a
              href={`https://www.openstreetmap.org/?mlat=${row.location.lat}&mlon=${row.location.lng}#map=17/${row.location.lat}/${row.location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4f378a] text-sm underline"
            >
              View on map
            </a>
          )}
        </div>
      ),
    }
  ];

  return (
    <div className="space-y-6 text-[#e8e3f0]">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Orders</h1>
          <p className="text-sm text-[#9ca3af] mt-0.5">Manage and track all customer orders</p>
        </div>
        <button
          onClick={() => fetchOrders(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-sm font-bold rounded-xl transition-all cursor-pointer shadow-sm text-white"
          title="Refresh orders"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {ORDER_STATS.map((stat) => (
          <div key={stat.label} className="bg-[#1a1a24] border border-white/[0.06] shadow-sm rounded-2xl p-4 transition-all hover:border-[#7c5cbf]/30">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#6b7280]">{stat.label}</p>
            <p className="text-2xl font-extrabold text-white mt-2">{stat.value}</p>
            <div className="mt-2 h-0.5 w-8 rounded-full" style={{ backgroundColor: stat.color }} />
          </div>
        ))}
      </div>

      {/* Search + filter bar */}
      <div className="bg-[#1a1a24] border border-white/[0.06] shadow-sm rounded-2xl p-4">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
            <input
              type="text"
              placeholder="Search by order ID or customer details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm text-[#e8e3f0] placeholder-[#6b7280] outline-none focus:border-[#7c5cbf]/60 transition-all"
            />
          </div>

          {/* Status filter pills */}
          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusFilterChange(s)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  statusFilter === s
                    ? "bg-[#4f378a] text-white shadow-sm"
                    : "bg-white/[0.06] text-[#9ca3af] hover:bg-white/[0.1] hover:text-[#e8e3f0]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table container */}
      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        emptyMessage="No orders found matching your search."
      />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.06] pt-4 px-1">
          <div className="text-xs text-[#9ca3af]">
            Showing <span className="font-bold text-white">{Math.min((currentPage - 1) * limit + 1, totalOrders)}</span> to{" "}
            <span className="font-bold text-white">{Math.min(currentPage * limit, totalOrders)}</span> of{" "}
            <span className="font-bold text-white">{totalOrders}</span> entries
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] disabled:opacity-40 disabled:hover:bg-white/[0.06] disabled:cursor-not-allowed border border-white/[0.08] text-xs font-bold rounded-xl text-white transition-all cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || loading}
              className="px-4 py-2 bg-[#4f378a] hover:bg-[#5f479a] disabled:opacity-40 disabled:hover:bg-[#4f378a] disabled:cursor-not-allowed text-xs font-bold rounded-xl text-white border-none transition-all cursor-pointer shadow-[0_4px_14px_rgba(79,55,138,0.2)]"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}