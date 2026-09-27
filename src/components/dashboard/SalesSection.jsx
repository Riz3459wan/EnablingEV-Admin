import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  TrendingUp,
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Package,
  BarChart3,
  Calendar,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import CountUp from "./shared/CountUp";
import SalesOrderDetailsModal from "./SalesOrderDetailsModal";
import DeliveredOrdersListModal from "./DeliveredOrdersListModal";
import { useOrders } from "../../hooks/useOrders";
import { LoadingCard, ErrorCard } from "../ui/AsyncStates";

const toArray = (v) => (Array.isArray(v) ? v : []);

const formatINR = (v) => {
  const n = Number(v) || 0;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
};

const TREND_FILTERS = [
  { value: "7d", label: "Last 7 days", days: 7 },
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "90d", label: "Last 90 days", days: 90 },
  { value: "all", label: "All time", days: null },
];

const buildTrendData = (orders, days) => {
  const today = new Date();
  const startDate = days
    ? new Date(today.getTime() - days * 24 * 60 * 60 * 1000)
    : null;

  const inRange = orders.filter((o) => {
    if (!days) return true;
    const dateStr = o.deliveredOn || o.createdOn;
    if (!dateStr) return false;
    const orderDate = new Date(dateStr);
    return orderDate >= startDate;
  });

  if (inRange.length === 0) {
    return [
      { day: "start", value: 0 },
      { day: "end", value: 0 },
    ];
  }

  const dayMap = {};
  inRange.forEach((o) => {
    const date = o.deliveredOn || o.createdOn;
    if (!date) return;
    dayMap[date] = (dayMap[date] || 0) + (Number(o.totalAmount) || 0);
  });

  const sorted = Object.entries(dayMap)
    .map(([label, value]) => {
      const parts = label.split(" ");
      const shortLabel =
        `${parts[0]} ${parts[1]?.replace(",", "") || ""}`.trim();
      return {
        day: shortLabel,
        sortKey: new Date(label).getTime() || 0,
        value,
      };
    })
    .sort((a, b) => a.sortKey - b.sortKey);

  if (sorted.length === 1) {
    return [
      { day: "start", value: 0, sortKey: sorted[0].sortKey - 1 },
      ...sorted,
    ];
  }

  return sorted;
};

const SalesSection = () => {
  const navigate = useNavigate();
  const [trendFilter, setTrendFilter] = useState("30d");
  const [orderModalFor, setOrderModalFor] = useState(null);
  const [listModalFor, setListModalFor] = useState(null);

  const { data: ordersData, loading, error } = useOrders();

  const orders = toArray(ordersData);

  const analytics = useMemo(() => {
    const deliveredOrders = orders.filter((o) => o.status === "Delivered");

    const totalSales = deliveredOrders.reduce(
      (sum, o) => sum + (Number(o.totalAmount) || 0),
      0,
    );

    const deliveredCount = deliveredOrders.length;

    const rikshawDelivered = deliveredOrders.filter((o) =>
      String(o.vehicleType || "")
        .toLowerCase()
        .includes("rikshaw"),
    );
    const cargoDelivered = deliveredOrders.filter((o) => {
      const v = String(o.vehicleType || "").toLowerCase();
      return v.includes("cargo") || v.includes("loader");
    });

    const byVehicleType = [
      {
        label: "Rikshaw",
        key: "rikshaw",
        value: rikshawDelivered.reduce(
          (s, o) => s + (Number(o.totalAmount) || 0),
          0,
        ),
        count: rikshawDelivered.length,
        color: "#3b82f6",
      },
      {
        label: "Cargo / Loader",
        key: "cargo",
        value: cargoDelivered.reduce(
          (s, o) => s + (Number(o.totalAmount) || 0),
          0,
        ),
        count: cargoDelivered.length,
        color: "#10b981",
      },
    ];

    const recentDelivered = [...deliveredOrders]
      .sort((a, b) => (b.id || 0) - (a.id || 0))
      .slice(0, 5);

    return {
      totalSales,
      deliveredCount,
      byVehicleType,
      recentDelivered,
      averageOrderValue:
        deliveredCount > 0 ? Math.round(totalSales / deliveredCount) : 0,
    };
  }, [orders]);

  const trendData = useMemo(() => {
    const filter = TREND_FILTERS.find((f) => f.value === trendFilter);
    const delivered = orders.filter((o) => o.status === "Delivered");
    return buildTrendData(delivered, filter?.days);
  }, [orders, trendFilter]);

  if (loading) return <LoadingCard rows={6} />;
  if (error) return <ErrorCard message={error} />;

  return (
    <>
      <section
        className="animate-fade-in-up"
        style={{ animationDelay: "160ms" }}
      >
        <div className="rounded-3xl bg-white border border-slate-200/70 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.06)] overflow-hidden">
          {/* Header */}
          <div className="px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center shadow-sm shadow-purple-500/25">
                <TrendingUp size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight leading-none">
                  My Sales
                </h2>
                <p className="text-[11px] text-slate-500 mt-1">
                  <span className="font-bold text-emerald-600 tabular">
                    {formatINR(analytics.totalSales)}
                  </span>{" "}
                  from{" "}
                  <span className="font-bold text-slate-700 tabular">
                    {analytics.deliveredCount}
                  </span>{" "}
                  delivered order
                  {analytics.deliveredCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/orders?status=Delivered")}
              className="group inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-white px-3.5 py-2 rounded-lg border border-slate-200 hover:border-slate-900 hover:bg-slate-900 transition-all"
            >
              View All
              <ArrowUpRight
                size={13}
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              />
            </button>
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            {/* Revenue Trend + Filter */}
            <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/40 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                    <TrendingUp size={13} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-800 leading-none">
                      Revenue Trend
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      From delivered orders
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Calendar
                      size={12}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <select
                      value={trendFilter}
                      onChange={(e) => setTrendFilter(e.target.value)}
                      className="appearance-none bg-white border border-slate-200 rounded-lg pl-7 pr-6 py-1.5 text-[11px] font-bold text-slate-700 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 cursor-pointer"
                    >
                      {TREND_FILTERS.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
                      width="8"
                      height="5"
                      viewBox="0 0 8 5"
                      fill="none"
                    >
                      <path
                        d="M1 1L4 4L7 1"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900 tabular leading-none">
                      {formatINR(analytics.totalSales)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-2 pt-3 pb-2">
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient
                        id="salesGradModern"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#10b981"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="100%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip
                      formatter={(v) => [formatINR(v), "Delivered Sales"]}
                      contentStyle={{
                        borderRadius: 10,
                        border: "1px solid #e2e8f0",
                        fontSize: 11,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fill="url(#salesGradModern)"
                      dot={{
                        r: 4,
                        fill: "#10b981",
                        strokeWidth: 2,
                        stroke: "#fff",
                      }}
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative rounded-2xl border border-slate-200/80 bg-white overflow-hidden p-4">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 to-teal-600" />
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/25">
                    <CheckCircle2 size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                      Delivered
                    </p>
                    <p className="text-2xl font-black tabular text-slate-900 leading-none mt-1">
                      <CountUp end={analytics.deliveredCount} duration={800} />
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">orders</p>
                  </div>
                </div>
              </div>

              <div className="relative rounded-2xl border border-slate-200/80 bg-white overflow-hidden p-4">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-500 to-fuchsia-600" />
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center shrink-0 shadow-sm shadow-purple-500/25">
                    <BarChart3 size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                      Total Sales
                    </p>
                    <p className="text-2xl font-black tabular text-slate-900 leading-none mt-1">
                      {formatINR(analytics.totalSales)}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      from delivered
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative rounded-2xl border border-slate-200/80 bg-white overflow-hidden p-4">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 to-cyan-600" />
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/25">
                    <Activity size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                      Avg / Order
                    </p>
                    <p className="text-2xl font-black tabular text-slate-900 leading-none mt-1">
                      {formatINR(analytics.averageOrderValue)}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      per delivered
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* By Vehicle Type */}
            <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Package size={13} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-800 leading-none">
                      Sales by Vehicle Type
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Click to view delivered orders
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setListModalFor({ title: "All Delivered Orders" })
                  }
                  className="group inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  View All
                  <ArrowUpRight
                    size={11}
                    className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  />
                </button>
              </div>

              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {analytics.byVehicleType.map((v) => {
                  const pct =
                    analytics.totalSales > 0
                      ? (v.value / analytics.totalSales) * 100
                      : 0;
                  return (
                    <button
                      key={v.key}
                      onClick={() =>
                        setListModalFor({
                          title: `${v.label} — Delivered Orders`,
                          initialType: v.key,
                        })
                      }
                      className="group/type relative text-left rounded-xl border border-slate-200/70 bg-white hover:border-slate-300 hover:shadow-md transition-all duration-300 overflow-hidden active:scale-[0.98] p-3"
                    >
                      <div
                        className="absolute top-0 left-0 bottom-0 w-[3px] transition-all duration-300 group-hover/type:w-[4px]"
                        style={{ backgroundColor: v.color }}
                      />
                      <div className="pl-2">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-black text-slate-900 leading-none group-hover/type:text-slate-700">
                              {v.label}
                            </p>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">
                              {v.count} delivered
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <p
                              className="text-xl font-black tabular leading-none"
                              style={{ color: v.color }}
                            >
                              {formatINR(v.value)}
                            </p>
                            <ArrowUpRight
                              size={13}
                              className="text-slate-300 group-hover/type:text-slate-700 group-hover/type:translate-x-0.5 group-hover/type:-translate-y-0.5 transition-all"
                            />
                          </div>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${pct}%`,
                              background: `linear-gradient(90deg, ${v.color}, ${v.color}cc)`,
                            }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1.5 tabular">
                          {pct.toFixed(0)}% of total sales
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent Deliveries — full width, no grid */}
            <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-800 leading-none">
                      Recent Deliveries
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Latest 5 completed sales · click to view &amp; download
                      invoice
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setListModalFor({ title: "All Delivered Orders" })
                  }
                  className="group inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  View All
                  <ArrowUpRight
                    size={11}
                    className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  />
                </button>
              </div>
              <div className="p-3 space-y-1">
                {analytics.recentDelivered.length === 0 ? (
                  <p className="text-center text-slate-400 text-xs py-4">
                    No delivered orders yet
                  </p>
                ) : (
                  analytics.recentDelivered.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setOrderModalFor(o)}
                      className="group/row w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {o.chassisNumber || o.orderNumber}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {o.dealerName} · {o.modelName} · {o.deliveredOn}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-xs font-black text-emerald-600 tabular">
                          {formatINR(o.totalAmount)}
                        </span>
                        <ArrowUpRight
                          size={11}
                          className="text-slate-300 group-hover/row:text-emerald-600 group-hover/row:translate-x-0.5 group-hover/row:-translate-y-0.5 transition-all"
                        />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sales Order Details Modal */}
      <SalesOrderDetailsModal
        order={orderModalFor}
        onClose={() => setOrderModalFor(null)}
      />

      {/* Delivered Orders List Modal */}
      <DeliveredOrdersListModal
        filter={listModalFor}
        onClose={() => setListModalFor(null)}
      />
    </>
  );
};

export default SalesSection;
