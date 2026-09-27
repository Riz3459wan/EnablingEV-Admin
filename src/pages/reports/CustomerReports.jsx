import { useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Users, MapPin, Building2, Calendar } from "lucide-react";
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
import { useCustomers } from "../../hooks/useCustomers";

const toArray = (v) => (Array.isArray(v) ? v : []);

const DATE_FILTERS = [
  { value: "7d", label: "Last 7 days", days: 7 },
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "90d", label: "Last 90 days", days: 90 },
  { value: "all", label: "All time", days: null },
];

// Customer me date field nahi hai — fallback: filter skip karo
const filterByDate = (list, days) => {
  if (!days) return list;
  // Agar customer me date nahi hai to sab return karo
  return list.filter((c) => {
    const dateStr = c.createdOn || c.addedOn || c.date;
    if (!dateStr) return true;
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return true;
    return d >= new Date(Date.now() - days * 24 * 60 * 60 * 1000);
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

const CustomerReports = () => {
  const [dateFilter, setDateFilter] = useState("all");

  const { data, loading, error } = useCustomers();
  const allCustomers = toArray(data);

  const days = DATE_FILTERS.find((f) => f.value === dateFilter)?.days;
  const customers = useMemo(
    () => filterByDate(allCustomers, days),
    [allCustomers, days],
  );

  const analytics = useMemo(() => {
    const total = customers.length;

    const stateMap = {};
    customers.forEach((c) => {
      const state = c.state || "Unknown";
      stateMap[state] = (stateMap[state] || 0) + 1;
    });
    const stateData = Object.entries(stateMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const distMap = {};
    customers.forEach((c) => {
      const dist = c.dist || "Unknown";
      distMap[dist] = (distMap[dist] || 0) + 1;
    });
    const distData = Object.entries(distMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const dealerMap = {};
    customers.forEach((c) => {
      const key = c.dealerCode || "UNKNOWN";
      dealerMap[key] = (dealerMap[key] || 0) + 1;
    });
    const dealerData = Object.entries(dealerMap)
      .map(([code, value]) => ({ code, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const uniqueStates = new Set(customers.map((c) => c.state).filter(Boolean))
      .size;
    const uniqueDistricts = new Set(
      customers.map((c) => c.dist).filter(Boolean),
    ).size;
    const uniqueDealers = new Set(
      customers.map((c) => c.dealerCode).filter(Boolean),
    ).size;

    return {
      total,
      uniqueStates,
      uniqueDistricts,
      uniqueDealers,
      stateData,
      distData,
      dealerData,
    };
  }, [customers]);

  const columns = useMemo(
    () => [
      {
        key: "chassisNumber",
        label: "Chassis No.",
        className: "font-mono text-xs",
      },
      { key: "dealerCode", label: "Dealer" },
      { key: "name", label: "Name" },
      { key: "mobileNumber", label: "Mobile" },
      { key: "emailId", label: "Email" },
      { key: "dist", label: "District" },
      { key: "state", label: "State" },
      { key: "pincode", label: "Pincode" },
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
    "#ec4899",
    "#14b8a6",
  ];

  if (loading) return <LoadingCard rows={6} />;
  if (error) return <ErrorCard message={error} />;

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
            Customer Reports
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Analytics on customer distribution and geographic reach.
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
            label="Total Customers"
            value={analytics.total}
            color="blue"
          />
          <StatCard
            icon={Building2}
            label="Dealers with Customers"
            value={analytics.uniqueDealers}
            color="green"
            sub="having active customers"
          />
          <StatCard
            icon={MapPin}
            label="States Covered"
            value={analytics.uniqueStates}
            color="purple"
          />
          <StatCard
            icon={MapPin}
            label="Districts Covered"
            value={analytics.uniqueDistricts}
            color="orange"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="p-5">
            <h2 className="font-bold text-slate-800 mb-4">Top States</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analytics.stateData} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
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
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-5">
            <h2 className="font-bold text-slate-800 mb-4">Top Districts</h2>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={analytics.distData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {analytics.distData.map((entry, i) => (
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
          </Card>
        </div>

        {/* Top Dealers */}
        <Card className="p-5">
          <h2 className="font-bold text-slate-800 mb-4">
            Top Dealers by Customer Count
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={analytics.dealerData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={false}
              />
              <XAxis
                dataKey="code"
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
              <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Table */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">All Customers</h2>
            <span className="text-xs text-slate-500">
              {analytics.total} total
            </span>
          </div>
          <DataTable
            columns={columns}
            rows={customers.slice(0, 20)}
            rowKey={(r) => r.id ?? r.chassisNumber}
            emptyText="No customers registered."
          />
          {customers.length > 20 && (
            <p className="text-center text-xs text-slate-400 mt-4">
              Showing first 20 of {customers.length} records
            </p>
          )}
        </Card>
      </div>
    </section>
  );
};

export default CustomerReports;
