import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiArrowUpRight, FiTrendingUp, FiRefreshCw } from "react-icons/fi";
import axiosInstance from "../../api/axiosInstance";
import DataTable from "../../Components/UI/DataTable";

/* ══ SPARKLINE MINI CHART ════════════════════════════════════════════════ */
function Sparkline({ path, positive }) {
  const color = positive ? "#7c5cbf" : "#f87171";
  return (
    <svg width="100" height="40" viewBox="0 0 100 40" fill="none" className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${path.slice(0, 5)}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={path} stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/admin/stats");
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error("Dashboard stats error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const STATS_CARDS = stats
    ? [
        {
          id: "revenue",
          label: "Total Revenue",
          value: stats.totalRevenue,
          change: "+12.5%",
          positive: true,
          sparkline: "M0,35 C10,30 15,20 25,22 C35,24 40,12 50,10 C60,8 65,15 75,12 C85,9 90,5 100,2",
        },
        {
          id: "orders",
          label: "Total Orders",
          value: stats.totalOrders,
          change: "+8.2%",
          positive: true,
          sparkline: "M0,32 C10,28 20,26 30,20 C40,14 50,18 60,12 C70,6 80,10 90,6 C95,4 98,3 100,2",
        },
        {
          id: "customers",
          label: "New Customers",
          value: stats.newCustomers,
          change: "+4.1%",
          positive: true,
          sparkline: "M0,38 C15,34 20,32 35,24 C45,18 55,22 65,16 C75,10 85,8 100,4",
        },
        {
          id: "conversion",
          label: "Conversion Rate",
          value: stats.conversionRate,
          change: "+0.5%",
          positive: true,
          sparkline: "M0,36 C10,33 25,30 35,26 C45,22 55,20 65,16 C75,12 85,10 100,6",
        },
      ]
    : [];

  const recentOrdersColumns = [
    {
      key: "id",
      label: "ORDER ID",
      render: (val) => <span className="text-sm font-bold text-[#c8b7ff]">{val}</span>,
    },
    {
      key: "customer",
      label: "CUSTOMER",
      render: (val) => (
        <div className="flex items-center gap-2.5">
          <span
            style={{ backgroundColor: val.color }}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-extrabold shrink-0"
          >
            {val.initials}
          </span>
          <span className="text-sm font-semibold text-[#e8e3f0] whitespace-nowrap">
            {val.name}
          </span>
        </div>
      ),
    },
    {
      key: "product",
      label: "PRODUCT",
      render: (val) => <span className="text-sm text-[#9ca3af]">{val}</span>,
    },
    {
      key: "amount",
      label: "AMOUNT",
      render: (val) => <span className="text-sm font-bold text-white">{val}</span>,
    },
    {
      key: "status",
      label: "STATUS",
      render: (val, row) => (
        <span
          className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-[0.08em] uppercase border ${row.statusColor}`}
        >
          {val}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8 text-[#e8e3f0]">
      {/* ── Welcome Header ──────────────────────── */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, Admin
          </h1>
          <p className="text-sm text-[#9ca3af] mt-1">
            System status is operational. Here&apos;s what happened today.
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="p-2 rounded-xl text-[#9ca3af] hover:text-[#e8e3f0] hover:bg-white/[0.06] transition-all border-none bg-transparent cursor-pointer"
          title="Refresh Dashboard"
        >
          <FiRefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* ── Stats Grid ──────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-[#1a1a24] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-3 animate-pulse"
              >
                <div className="h-3 bg-white/[0.06] rounded-md w-1/2"></div>
                <div className="flex items-end justify-between">
                  <div className="h-8 bg-white/[0.06] rounded-md w-1/3"></div>
                  <div className="h-10 bg-white/[0.06] rounded-md w-24"></div>
                </div>
                <div className="h-3 bg-white/[0.06] rounded-md w-2/3"></div>
              </div>
            ))
          : STATS_CARDS.map((stat) => (
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
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-4 py-3 px-3 animate-pulse">
                <div className="w-4 h-4 bg-white/[0.06] rounded"></div>
                <div className="w-10 h-10 bg-white/[0.06] rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/[0.06] rounded w-1/3"></div>
                  <div className="h-3 bg-white/[0.06] rounded w-1/4"></div>
                </div>
                <div className="w-12 h-6 bg-white/[0.06] rounded"></div>
              </div>
            ))
          ) : stats?.topProducts?.length === 0 ? (
            <p className="text-sm text-[#6b7280] text-center py-6">No product sales recorded yet.</p>
          ) : (
            stats?.topProducts?.map((product, idx) => (
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
            ))
          )}
        </div>
      </div>

      {/* ── Recent Orders ───────────────────────── */}
      <div className="space-y-4">
        {/* Section header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-extrabold text-white">Recent Orders</h2>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-[#7c5cbf] hover:text-[#c8b7ff] transition-colors no-underline"
          >
            View All Orders →
          </Link>
        </div>

        {/* Orders Table inside our Dark DataTable */}
        <DataTable
          columns={recentOrdersColumns}
          data={stats?.recentOrders || []}
          loading={loading}
          emptyMessage="No recent orders placed yet."
        />
      </div>
    </div>
  );
}
