import { useState, useEffect } from "react";
import { FiSearch, FiRefreshCw } from "react-icons/fi";
import { toast } from "sonner";
import axiosInstance from "../../api/axiosInstance";
import DataTable from "../../Components/UI/DataTable";

export default function AdminCustomers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = async (showToast = false) => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/admin/users");
      if (res.data.success) {
        setUsers(res.data.users);
        if (showToast) {
          toast.success("Customer list refreshed successfully");
        }
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error(err.response?.data?.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  /* Calculate quick stats */
  const totalCount = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const customerCount = users.filter((u) => u.role === "customer").length;
  const newThisMonth = users.filter(
    (u) => new Date(u.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length;

  const CUSTOMER_STATS = [
    { label: "Total Customers", value: totalCount, color: "#7c5cbf" },
    { label: "Admins", value: adminCount, color: "#3b82f6" },
    { label: "Standard Customers", value: customerCount, color: "#22c55e" },
    { label: "Joined This Month", value: newThisMonth, color: "#fb923c" },
  ];

  const columns = [
    {
      key: "name",
      label: "CUSTOMER",
      render: (val) => {
        const initials = val
          ? val
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
          : "U";
        return (
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7c5cbf] to-[#4f378a] text-white text-[11px] font-extrabold flex items-center justify-center shadow-sm shrink-0">
              {initials}
            </span>
            <span className="text-sm font-bold text-[#e8e3f0] group-hover:text-white transition-colors">{val}</span>
          </div>
        );
      },
    },
    {
      key: "email",
      label: "EMAIL ADDRESS",
      render: (val) => <span className="text-sm text-[#9ca3af] font-medium">{val}</span>,
    },
    {
      key: "role",
      label: "SYSTEM ROLE",
      render: (val) => (
        <span
          className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-[0.08em] uppercase border ${
            val === "admin"
              ? "text-[#34d399] bg-[#34d399]/10 border-[#34d399]/20"
              : "text-[#22d3ee] bg-[#22d3ee]/10 border-[#22d3ee]/20"
          }`}
        >
          {val}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "JOINED DATE",
      render: (val) => (
        <span className="text-xs text-[#6b7280] font-semibold">
          {new Date(val).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-[#e8e3f0]">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Customers</h1>
          <p className="text-sm text-[#9ca3af] mt-0.5">View and manage your registered customer base</p>
        </div>
        <button
          onClick={() => fetchUsers(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-sm font-bold rounded-xl transition-all cursor-pointer shadow-sm text-white"
          title="Refresh customers"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {CUSTOMER_STATS.map((stat) => (
          <div key={stat.label} className="bg-[#1a1a24] border border-white/[0.06] shadow-sm rounded-2xl p-4 transition-all hover:border-[#7c5cbf]/30">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#6b7280]">{stat.label}</p>
            <p className="text-2xl font-extrabold text-white mt-2">{stat.value}</p>
            <div className="mt-2 h-0.5 w-8 rounded-full" style={{ backgroundColor: stat.color }} />
          </div>
        ))}
      </div>

      {/* Search bar */}
      <div className="bg-[#1a1a24] border border-white/[0.06] rounded-2xl p-4">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
          <input
            type="text"
            placeholder="Search by customer name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm text-[#e8e3f0] placeholder-[#6b7280] outline-none focus:border-[#7c5cbf]/60 transition-all"
          />
        </div>
      </div>

      {/* Table container */}
      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        emptyMessage="No customers found matching your search query."
      />
    </div>
  );
}
