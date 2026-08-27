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

  const totalCount = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const customerCount = users.filter((u) => u.role === "customer").length;
  const newThisMonth = users.filter(
    (u) => new Date(u.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length;

  const CUSTOMER_STATS = [
    { label: "Total Customers", value: totalCount, accentColor: "bg-[#7c3aed] dark:bg-[#d0bcff]" },
    { label: "Admins", value: adminCount, accentColor: "bg-emerald-500 dark:bg-[#4edea3]" },
    { label: "Standard", value: customerCount, accentColor: "bg-amber-500 dark:bg-[#ffb95f]" },
    { label: "Joined This Month", value: newThisMonth, accentColor: "bg-blue-500 dark:bg-[#3b82f6]" },
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
            <span className="w-9 h-9 rounded-full bg-[#7c3aed]/15 dark:bg-[#d0bcff]/20 text-[#7c3aed] dark:text-[#d0bcff] text-xs font-extrabold flex items-center justify-center shrink-0 border border-[#7c3aed]/20 dark:border-[#d0bcff]/30">
              {initials}
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-[#e8e3f0] group-hover:text-[#7c3aed] dark:group-hover:text-white transition-colors">
              {val}
            </span>
          </div>
        );
      },
    },
    {
      key: "email",
      label: "EMAIL ADDRESS",
      render: (val) => <span className="text-sm text-slate-500 dark:text-[#9ca3af] font-medium">{val}</span>,
    },
    {
      key: "role",
      label: "SYSTEM ROLE",
      render: (val) => (
        <span
          className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase border ${
            val === "admin"
              ? "text-emerald-600 dark:text-[#4edea3] bg-emerald-500/10 border-emerald-500/20"
              : "text-blue-600 dark:text-[#38bdf8] bg-blue-500/10 border-blue-500/20"
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
        <span className="text-xs text-slate-500 dark:text-[#9ca3af] font-semibold">
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
    <div className="space-y-6 text-slate-800 dark:text-[#e8e3f0]">
      {/* Page Header (Matching Stitch Design) */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Customers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#9ca3af] mt-1">
            View and manage your registered customer base
          </p>
        </div>
        <button
          onClick={() => fetchUsers(true)}
          className="w-10 h-10 rounded-full bg-white dark:bg-[#1b1b1d] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-[#2a2a2c] transition-colors shadow-xs cursor-pointer"
          title="Refresh customers"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#7c3aed]" : ""}`} />
        </button>
      </div>

      {/* Metrics Cards Grid (Matching Stitch Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {CUSTOMER_STATS.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-[#1b1b1d] border border-slate-200 dark:border-white/10 rounded-2xl p-4 relative overflow-hidden shadow-xs flex flex-col justify-between"
          >
            <div className={`absolute bottom-0 left-0 w-full h-[2px] ${stat.accentColor}`} />
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 dark:text-[#9ca3af]">
              {stat.label}
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-[#9ca3af]" />
        <input
          type="text"
          placeholder="Search by customer name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-[#1b1b1d] border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-[#e8e3f0] placeholder:text-slate-400 dark:placeholder:text-[#9ca3af] outline-none focus:ring-2 focus:ring-[#7c3aed] dark:focus:ring-[#d0bcff] transition-all shadow-xs"
        />
      </div>

      {/* Mobile Customer Cards View (< 768px) */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#1b1b1d] border border-slate-200 dark:border-white/10 p-4 rounded-2xl animate-pulse space-y-2"
            >
              <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-1/3"></div>
              <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-1/2"></div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-[#1b1b1d] border border-slate-200 dark:border-white/10 rounded-2xl p-8 text-center text-slate-400 dark:text-[#6b7280] text-sm">
            No customers found matching your search query.
          </div>
        ) : (
          filtered.map((userItem) => {
            const initials = userItem.name
              ? userItem.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              : "U";

            return (
              <div
                key={userItem._id}
                className="bg-white dark:bg-[#1b1b1d] border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex flex-col gap-3 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-[#7c3aed]/15 dark:bg-[#d0bcff]/20 text-[#7c3aed] dark:text-[#d0bcff] text-xs font-extrabold flex items-center justify-center shrink-0 border border-[#7c3aed]/20 dark:border-[#d0bcff]/30">
                    {initials}
                  </span>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {userItem.name}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-[#9ca3af] truncate">
                      {userItem.email}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-white/10 text-xs">
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase border ${
                      userItem.role === "admin"
                        ? "text-emerald-600 dark:text-[#4edea3] bg-emerald-500/10 border-emerald-500/20"
                        : "text-blue-600 dark:text-[#38bdf8] bg-blue-500/10 border-blue-500/20"
                    }`}
                  >
                    {userItem.role}
                  </span>
                  <span className="text-slate-400 dark:text-[#9ca3af] font-medium">
                    Joined{" "}
                    {new Date(userItem.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table View (>= 768px) */}
      <div className="hidden md:block">
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyMessage="No customers found matching your search query."
        />
      </div>
    </div>
  );
}
