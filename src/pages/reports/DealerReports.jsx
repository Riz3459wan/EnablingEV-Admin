import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  Users,
  MapPin,
  TrendingUp,
  CheckCircle2,
  Star,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Card from "../../components/ui/Card";
import DataTable from "../../components/ui/DataTable";
import { ErrorCard, LoadingCard } from "../../components/ui/AsyncStates";
import { formatINR } from "../../features/quotation/calc";
import { useDealers } from "../../hooks/useDealers";
import { useOrders } from "../../hooks/useOrders";

const toArray = (v) => (Array.isArray(v) ? v : []);

const DATE_FILTERS = [
  { value: "7d", label: "Last 7 days", days: 7 },
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "90d", label: "Last 90 days", days: 90 },
  { value: "all", label: "All time", days: null },
];

const filterByDate = (list, days, dateField = "createdOn") => {
  if (!days) return list;
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return list.filter((item) => {
    const dateStr = item[dateField];
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return !Number.isNaN(d.getTime()) && d >= cutoff;
  });
};

const StatCard = ({ icon: Icon, label, value, color = "blue", sub }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };
  return (
    <Card className="p-5">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}
      >
        <Icon size={18} />
      </div>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-800 leading-tight">{value}</p>
      {sub && <p className="text-[11px] text-slate-400 mt-1">{sub}</p>}
    </Card>
  );
};

const DealerReports = () => {
  const [dateFilter, setDateFilter] = useState("all");

  const {
    data: dealersData,
    loading: dealersLoading,
    error: dealersError,
  } = useDealers();
  const { data: ordersData, loading: ordersLoading } = useOrders();

  const allDealers = toArray(dealersData);
  const allOrders = toArray(ordersData);

  const days = DATE_FILTERS.find((f) => f.value === dateFilter)?.days;
  const orders = useMemo(
    () => filterByDate(allOrders, days),
    [allOrders, days],
  );
  const dealers = allDealers; // dealers ko date-filter nahi karte

  const analytics = useMemo(() => {
    // Enrich dealers with order stats
    const enriched = dealers.map((d) => {
      const dOrders = orders.filter((o) => o.dealerCode === d.dealerCode);
      const delivered = dOrders.filter((o) => o.status === "Delivered");
      const totalValue = delivered.reduce(
        (s, o) => s + (Number(o.totalAmount) || 0),
        0,
      );
      return {
        ...d,
        _totalOrders: dOrders.length,
        _delivered: delivered.length,
        _totalValue: totalValue,
      };
    });

    const totalDealers = dealers.length;
    const activeDealers = dealers.filter((d) => d.activationCode).length;

    // State map
    const stateMap = {};
    dealers.forEach((d) => {
      const state = d.state || "Unknown";
      stateMap[state] = (stateMap[state] || 0) + 1;
    });
    const stateData = Object.entries(stateMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Top by value
    const topByValue = [...enriched]
      .sort((a, b) => b._totalValue - a._totalValue)
      .slice(0, 5)
      .map((d) => ({
        name: d.name.split(" ").slice(0, 2).join(" "),
        value: d._totalValue,
      }));

    // Top by orders
    const topByCount = [...enriched]
      .sort((a, b) => b._totalOrders - a._totalOrders)
      .slice(0, 8)
      .map((d) => ({
        name: d.name.split(" ")[0],
        value: d._totalOrders,
      }));

    // Top by delivered
    const topByDispatched = [...enriched]
      .sort((a, b) => b._delivered - a._delivered)
      .slice(0, 8)
      .map((d) => ({
        name: d.name.split(" ")[0],
        value: d._delivered,
      }));

    const totalQuotationValue = enriched.reduce(
      (sum, d) => sum + d._totalValue,
      0,
    );

    return {
      enriched,
      totalDealers,
      activeDealers,
      stateData,
      topByValue,
      topByCount,
      topByDispatched,
      totalQuotationValue,
    };
  }, [dealers, orders]);

  const columns = useMemo(
    () => [
      { key: "dealerCode", label: "Code", className: "font-mono text-xs" },
      {
        key: "name",
        label: "Dealer",
        render: (row) => (
          <Link
            to={`/dealerDetails/${row.id || row.dealerCode}`}
            className="font-medium text-blue-600 hover:underline"
          >
            {row.name || "—"}
          </Link>
        ),
      },
      { key: "state", label: "State" },
      { key: "dist", label: "District" },
      {
        key: "_totalOrders",
        label: "Orders",
        render: (r) => (
          <span className="font-semibold text-slate-800 tabular">
            {r._totalOrders}
          </span>
        ),
      },
      {
        key: "_delivered",
        label: "Delivered",
        render: (r) => (
          <span className="font-semibold text-emerald-600 tabular">
            {r._delivered}
          </span>
        ),
      },
      {
        key: "_totalValue",
        label: "Total Value",
        render: (r) => (
          <span className="font-semibold text-slate-800 tabular">
            {formatINR(r._totalValue)}
          </span>
        ),
      },
    ],
    [],
  );

  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#8b5cf6",
    "#f59e0b",
    "#ef4444",
    "#06b6d4",
  ];

  if (dealersLoading || ordersLoading) return <LoadingCard rows={6} />;
  if (dealersError) return <ErrorCard message={dealersError} />;

  return (
    <section className="w-full">
      <Link
        to="/adminDash"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4"
      >
        <ArrowLeft size={15} /> Back to dashboard
      </Link>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            Reports
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            Dealer Reports
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Performance analytics across all registered dealers.
          </p>
        </div>

        {/* Date filter */}
        <div className="relative shrink-0">
          <Calendar
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="appearance-none bg-white border border-slate-300 rounded-lg pl-8 pr-8 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            {DATE_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
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
      </div>

      <div className="space-y-5">
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={Users}
            label="Total Dealers"
            value={analytics.totalDealers}
            color="blue"
          />
          <StatCard
            icon={CheckCircle2}
            label="Active Dealers"
            value={analytics.activeDealers}
            color="green"
            sub={`${analytics.totalDealers > 0 ? Math.round((analytics.activeDealers / analytics.totalDealers) * 100) : 0}% of total`}
          />
          <StatCard
            icon={MapPin}
            label="States Covered"
            value={analytics.stateData.length}
            color="purple"
          />
          <StatCard
            icon={TrendingUp}
            label="Total Business"
            value={formatINR(analytics.totalQuotationValue)}
            color="orange"
            sub="from delivered"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="p-5">
            <h2 className="font-bold text-slate-800 mb-4">
              Top Dealers by Value
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analytics.topByValue} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${Math.round(v / 100000)}L`}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  width={100}
                />
                <Tooltip
                  formatter={(v) => [formatINR(v), "Total Value"]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-5">
            <h2 className="font-bold text-slate-800 mb-4">
              Top Dealers by Orders
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analytics.topByCount}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="lg:col-span-2 p-5">
            <h2 className="font-bold text-slate-800 mb-4">
              Top Dealers by Deliveries
            </h2>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={analytics.topByDispatched}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-5">
            <h2 className="font-bold text-slate-800 mb-4">Dealers by State</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={analytics.stateData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {analytics.stateData.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-3 max-h-32 overflow-y-auto">
              {analytics.stateData.map((s, i) => (
                <div
                  key={s.name}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="flex items-center gap-2 text-slate-600">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    ></span>
                    {s.name}
                  </span>
                  <span className="font-semibold text-slate-800">
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Performance Table */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-orange-500" />
              <h2 className="font-bold text-slate-800">Dealer Performance</h2>
            </div>
            <span className="text-xs text-slate-500">
              {analytics.totalDealers} dealers
            </span>
          </div>
          <DataTable
            columns={columns}
            rows={[...analytics.enriched]
              .sort((a, b) => b._totalValue - a._totalValue)
              .slice(0, 20)}
            rowKey={(r) => r.id ?? r.dealerCode}
            emptyText="No dealers registered."
          />
          {dealers.length > 20 && (
            <p className="text-center text-xs text-slate-400 mt-4">
              Showing top 20 of {dealers.length} dealers
            </p>
          )}
        </Card>
      </div>
    </section>
  );
};

export default DealerReports;
