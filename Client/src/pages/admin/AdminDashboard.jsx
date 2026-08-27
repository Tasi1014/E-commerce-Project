import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiArrowUpRight, FiTrendingUp, FiRefreshCw } from "react-icons/fi";
import axiosInstance from "../../api/axiosInstance";
import DataTable from "../../Components/UI/DataTable";

/* ── Sparkline SVG Chart ─────────────────────────────────────── */
function Sparkline({ path, positive }) {
  const color = positive ? "#4edea3" : "#f87171";
  return (
    <svg width="80" height="32" viewBox="0 0 100 30" fill="none" className="overflow-visible opacity-80">
      <path d={path} stroke={color} strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
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
          accentColor: "bg-[#7c3aed] dark:bg-[#d0bcff]",
          sparkline: "M0 25 L20 15 L40 20 L60 5 L80 10 L100 2",
        },
        {
          id: "orders",
          label: "Total Orders",
          value: stats.totalOrders,
          change: "+8.2%",
          positive: true,
          accentColor: "bg-[#4edea3]",
          sparkline: "M0 28 L20 20 L40 24 L60 10 L80 14 L100 4",
        },
        {
          id: "customers",
          label: "New Customers",
          value: stats.newCustomers,
          change: "+4.1%",
          positive: true,
          accentColor: "bg-[#ffb95f]",
          sparkline: "M0 26 L20 22 L40 18 L60 12 L80 8 L100 3",
        },
        {
          id: "conversion",
          label: "Conversion Rate",
          value: stats.conversionRate,
          change: "+0.5%",
          positive: true,
          accentColor: "bg-[#3b82f6]",
          sparkline: "M0 24 L20 18 L40 15 L60 10 L80 6 L100 2",
        },
      ]
    : [];

  const recentOrdersColumns = [
    {
      key: "id",
      label: "ORDER ID",
      render: (val) => (
        <span className="text-sm font-bold text-[#7c3aed] dark:text-[#c8b7ff]">{val}</span>
      ),
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
          <span className="text-sm font-semibold text-slate-800 dark:text-[#e8e3f0] whitespace-nowrap">
            {val.name}
          </span>
        </div>
      ),
    },
    {
      key: "product",
      label: "PRODUCT",
      render: (val) => <span className="text-sm text-slate-500 dark:text-[#9ca3af]">{val}</span>,
    },
    {
      key: "amount",
      label: "AMOUNT",
      render: (val) => <span className="text-sm font-bold text-slate-900 dark:text-white">{val}</span>,
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
    <div className="space-y-6 sm:space-y-8 text-slate-800 dark:text-[#e8e3f0]">
      {/* ── Welcome Header (Matching Stitch Design) ────────── */}
      <section className="relative flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome back,
            </h1>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#7c3aed] dark:text-[#d0bcff] tracking-tight">
              Admin
            </h2>
          </div>
          <button
            onClick={fetchStats}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#1b1b1d] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-[#2a2a2c] transition-colors shadow-xs cursor-pointer"
            title="Refresh Dashboard"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#7c3aed]" : ""}`} />
          </button>
        </div>

        {/* Live operational indicator */}
        <div className="flex items-center gap-2 pt-1">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#cbc3d7]">
            System status is operational. Here&apos;s what happened today.
          </p>
        </div>
      </section>

      {/* ── Stat Metrics Cards Grid ──────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#1b1b1d] border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex flex-col gap-3 animate-pulse"
              >
                <div className="h-3 bg-slate-200 dark:bg-white/10 rounded-md w-1/2"></div>
                <div className="flex items-end justify-between">
                  <div className="h-8 bg-slate-200 dark:bg-white/10 rounded-md w-1/3"></div>
                  <div className="h-8 bg-slate-200 dark:bg-white/10 rounded-md w-20"></div>
                </div>
                <div className="h-3 bg-slate-200 dark:bg-white/10 rounded-md w-2/3"></div>
              </div>
            ))
          : STATS_CARDS.map((stat) => (
              <div
                key={stat.id}
                className="bg-white dark:bg-[#1b1b1d] border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden shadow-xs hover:border-[#7c3aed]/40 dark:hover:border-[#d0bcff]/40 transition-all duration-300 group"
              >
                {/* Accent bar at bottom */}
                <div className={`absolute bottom-0 left-0 w-full h-[2px] ${stat.accentColor}`} />

                {/* Card Header */}
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 dark:text-[#9ca3af]">
                    {stat.label}
                  </span>
                  <Sparkline path={stat.sparkline} positive={stat.positive} />
                </div>

                {/* Metric Value */}
                <div className="z-10">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-none tracking-tight">
                    {stat.value}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-xs font-bold text-emerald-500 dark:text-[#4edea3] flex items-center gap-0.5">
                      <FiArrowUpRight className="w-3.5 h-3.5" />
                      {stat.change}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-[#6b7280]">vs last month</span>
                  </div>
                </div>
              </div>
            ))}
      </section>

      {/* ── Top Products Section ────────────────────────── */}
      <section className="bg-white dark:bg-[#1b1b1d] border border-slate-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <FiTrendingUp className="w-5 h-5 text-[#7c3aed] dark:text-[#d0bcff]" />
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Top Products</h3>
          </div>
          <Link
            to="/admin/products"
            className="text-xs font-bold text-[#7c3aed] dark:text-[#d0bcff] hover:underline"
          >
            View All
          </Link>
        </div>

        <div className="flex flex-col space-y-1">
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-4 py-3 px-2 animate-pulse">
                <div className="w-4 h-4 bg-slate-200 dark:bg-white/10 rounded"></div>
                <div className="w-10 h-10 bg-slate-200 dark:bg-white/10 rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-1/3"></div>
                  <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-1/4"></div>
                </div>
                <div className="w-16 h-6 bg-slate-200 dark:bg-white/10 rounded"></div>
              </div>
            ))
          ) : stats?.topProducts?.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-[#6b7280] text-center py-6">
              No product sales recorded yet.
            </p>
          ) : (
            stats?.topProducts?.map((product, idx) => (
              <div
                key={product.id}
                className="group flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-bold text-slate-400 dark:text-[#9ca3af] w-4 text-center">
                    {idx + 1}
                  </span>
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-[#252532] border border-slate-200 dark:border-white/10 shrink-0">
                    <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-slate-800 dark:text-[#e8e3f0] truncate group-hover:text-[#7c3aed] dark:group-hover:text-white transition-colors">
                      {product.name}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-[#9ca3af]">
                      {product.category}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0 pl-2">
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {product.revenue}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-[#9ca3af]">
                    {product.sold}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── Recent Orders Section ───────────────────────── */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Recent Orders</h2>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-[#7c3aed] dark:text-[#d0bcff] hover:underline"
          >
            View All Orders →
          </Link>
        </div>

        {/* Responsive view: Mobile Cards vs Desktop Table */}
        <div className="block md:hidden space-y-3">
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
          ) : stats?.recentOrders?.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-[#6b7280] text-center py-6 bg-white dark:bg-[#1b1b1d] rounded-2xl border border-slate-200 dark:border-white/10">
              No recent orders placed yet.
            </p>
          ) : (
            stats?.recentOrders?.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-[#1b1b1d] border border-slate-200 dark:border-white/10 p-4 rounded-2xl shadow-xs space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[#7c3aed] dark:text-[#c8b7ff] font-bold text-xs">
                      {order.id}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                      {order.customer.name}
                    </h4>
                  </div>
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${order.statusColor}`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-white/10 text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-[#9ca3af] uppercase font-bold text-[10px]">
                      Product
                    </span>
                    <p className="font-semibold text-slate-800 dark:text-[#e8e3f0]">
                      {order.product}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 dark:text-[#9ca3af] uppercase font-bold text-[10px]">
                      Amount
                    </span>
                    <p className="font-extrabold text-slate-900 dark:text-white">{order.amount}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden md:block">
          <DataTable
            columns={recentOrdersColumns}
            data={stats?.recentOrders || []}
            loading={loading}
            emptyMessage="No recent orders placed yet."
          />
        </div>
      </section>
    </div>
  );
}
