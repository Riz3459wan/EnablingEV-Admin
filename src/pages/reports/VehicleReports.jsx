import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  Truck,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
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
import { useOrders } from "../../hooks/useOrders";
import { useInventorySummary } from "../../hooks/useInventory";

const toArray = (v) => (Array.isArray(v) ? v : []);

const formatINR = (v) => {
  const n = Number(v) || 0;
  if (n >= 10000000) return `₹${Math.round(n / 10000000)} Cr`;
  if (n >= 100000) return `₹${Math.round(n / 100000)} L`;
  if (n >= 1000) return `₹${Math.round(n / 1000)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
};

const ORDER_STATUS_META = {
  "Pending Approval": { color: "#f59e0b" },
  Approved: { color: "#3b82f6" },
  Rejected: { color: "#ef4444" },
  "Billing in Progress": { color: "#0ea5e9" },
  Billed: { color: "#6366f1" },
  "Ready to Dispatch": { color: "#8b5cf6" },
  Dispatched: { color: "#f97316" },
  Delivered: { color: "#10b981" },
};

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
    red: "bg-red-50 text-red-600",
    amber: "bg-amber-50 text-amber-600",
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

const VehicleReports = () => {
  const [dateFilter, setDateFilter] = useState("all");

  const {
    data: ordersData,
    loading: ordersLoading,
    error: ordersError,
  } = useOrders();
  const { data: inventoryData, loading: invLoading } = useInventorySummary();

  const allOrders = toArray(ordersData);
  const inventory = inventoryData || {};

  const days = DATE_FILTERS.find((f) => f.value === dateFilter)?.days;
  const orders = useMemo(
    () => filterByDate(allOrders, days),
    [allOrders, days],
  );

  const analytics = useMemo(() => {
    const totalOrders = orders.length;

    const statusMap = {};
    orders.forEach((o) => {
      statusMap[o.status] = (statusMap[o.status] || 0) + 1;
    });

    const statusData = Object.entries(statusMap)
      .map(([name, value]) => ({
        name,
        value,
        color: ORDER_STATUS_META[name]?.color || "#64748b",
      }))
      .sort((a, b) => b.value - a.value);

    const rikshaw = orders.filter((o) =>
      String(o.vehicleType || "")
        .toLowerCase()
        .includes("rikshaw"),
    );
    const cargo = orders.filter((o) => {
      const v = String(o.vehicleType || "").toLowerCase();
      return v.includes("cargo") || v.includes("loader");
    });

    const modelMap = {};
    orders.forEach((o) => {
      modelMap[o.modelName] = (modelMap[o.modelName] || 0) + 1;
    });
    const modelData = Object.entries(modelMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const colorMap = {};
    orders.forEach((o) => {
      colorMap[o.colorName] = (colorMap[o.colorName] || 0) + 1;
    });
    const colorData = Object.entries(colorMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const delivered = orders.filter((o) => o.status === "Delivered");
    const deliveredValue = delivered.reduce(
      (s, o) => s + (Number(o.totalAmount) || 0),
      0,
    );
    const totalValue = orders
      .filter((o) => o.status !== "Rejected")
      .reduce((s, o) => s + (Number(o.totalAmount) || 0), 0);
    const rejected = orders.filter((o) => o.status === "Rejected").length;
    const pending = orders.filter(
      (o) => o.status === "Pending Approval",
    ).length;

    return {
      totalOrders,
      statusData,
      rikshaw,
      cargo,
      modelData,
      colorData,
      delivered,
      deliveredValue,
      totalValue,
      rejected,
      pending,
      totalInventory: inventory.total || 0,
    };
  }, [orders, inventory]);

  const columns = useMemo(
    () => [
      {
        key: "chassisNumber",
        label: "Chassis No.",
        className: "font-mono text-xs",
      },
      {
        key: "orderNumber",
        label: "Order #",
        className: "font-mono text-xs",
      },
      { key: "modelName", label: "Model" },
      { key: "bodyTypeName", label: "Body" },
      { key: "colorName", label: "Color" },
      { key: "vehicleType", label: "Type" },
      { key: "dealerName", label: "Dealer" },
      {
        key: "status",
        label: "Status",
        render: (row) => (
          <span
            className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${ORDER_STATUS_META[row.status]?.color || "#64748b"}15`,
              color: ORDER_STATUS_META[row.status]?.color || "#64748b",
            }}
          >
            {row.status}
          </span>
        ),
      },
      {
        key: "totalAmount",
        label: "Amount",
        render: (row) => (
          <span className="font-semibold tabular">
            {formatINR(row.totalAmount)}
          </span>
        ),
      },
    ],
    [],
  );

  if (ordersLoading || invLoading) return <LoadingCard rows={6} />;
  if (ordersError) return <ErrorCard message={ordersError} />;

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
            Vehicle Reports
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Analytics across all orders, vehicles and inventory.
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
            icon={Truck}
            label="Total Vehicles"
            value={analytics.totalInventory}
            color="blue"
          />
          <StatCard
            icon={CheckCircle2}
            label="Delivered"
            value={analytics.delivered.length}
            color="green"
            sub={`${formatINR(analytics.deliveredValue)} value`}
          />
          <StatCard
            icon={Clock}
            label="Pending Approval"
            value={analytics.pending}
            color="amber"
          />
          <StatCard
            icon={XCircle}
            label="Rejected"
            value={analytics.rejected}
            color="red"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="lg:col-span-2 p-5">
            <h2 className="font-bold text-slate-800 mb-4">Top Models</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analytics.modelData}>
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

          <Card className="p-5">
            <h2 className="font-bold text-slate-800 mb-4">
              Status Distribution
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={analytics.statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {analytics.statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
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
            <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
              {analytics.statusData.map((d) => (
                <div
                  key={d.name}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="flex items-center gap-2 text-slate-600">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: d.color }}
                    ></span>
                    {d.name}
                  </span>
                  <span className="font-semibold text-slate-800">
                    {d.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Vehicle Type + Colors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="p-5">
            <h2 className="font-bold text-slate-800 mb-4">
              Vehicle Type Split
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    Rikshaw
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {analytics.rikshaw.length}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${analytics.totalOrders > 0 ? (analytics.rikshaw.length / analytics.totalOrders) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    Cargo / Loader
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {analytics.cargo.length}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${analytics.totalOrders > 0 ? (analytics.cargo.length / analytics.totalOrders) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-800 mt-6 mb-3">
              Top Colors
            </h3>
            <div className="space-y-2">
              {analytics.colorData.slice(0, 5).map((c) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-slate-600">{c.name}</span>
                  <span className="font-semibold text-slate-800">
                    {c.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-bold text-slate-800 mb-4">Sales Summary</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-200">
                <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider mb-1">
                  Delivered Value
                </p>
                <p className="text-3xl font-black text-emerald-700 tabular">
                  {formatINR(analytics.deliveredValue)}
                </p>
                <p className="text-xs text-emerald-600 mt-1">
                  From {analytics.delivered.length} delivered orders
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">
                    Total Orders
                  </p>
                  <p className="text-xl font-black text-slate-800 tabular">
                    {analytics.totalOrders}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">
                    Total Value
                  </p>
                  <p className="text-xl font-black text-slate-800 tabular">
                    {formatINR(analytics.totalValue)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Table */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">All Orders</h2>
            <span className="text-xs text-slate-500">
              {analytics.totalOrders} total
            </span>
          </div>
          <DataTable
            columns={columns}
            rows={orders.slice(0, 20)}
            rowKey={(r) => r.id ?? r.orderNumber}
            emptyText="No orders found."
          />
          {orders.length > 20 && (
            <p className="text-center text-xs text-slate-400 mt-4">
              Showing first 20 of {orders.length} records
            </p>
          )}
        </Card>
      </div>
    </section>
  );
};

export default VehicleReports;
