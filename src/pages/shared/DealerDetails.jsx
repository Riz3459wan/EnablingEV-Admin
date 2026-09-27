import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  FileText,
  Users,
  Truck,
  TrendingUp,
  Search,
  Eye,
  Key,
  CheckCircle2,
  Clock,
  Package,
  XCircle,
} from "lucide-react";
import Card from "../../components/ui/Card";
import { Input } from "../../components/ui/Field";
import DataTable from "../../components/ui/DataTable";
import Modal from "../../components/ui/Modal";
import { ErrorCard, LoadingCard } from "../../components/ui/AsyncStates";
import { formatINR, gstBreakdown } from "../../features/quotation/calc";
import { useDealer } from "../../hooks/useDealers";
import { useOrders } from "../../hooks/useOrders";
import { useCustomers } from "../../hooks/useCustomers";
import { useVehicles } from "../../hooks/useVehicles";
import usePagination from "../../hooks/usePagination";
import Pagination from "../../components/ui/Pagination";

const toArray = (v) => (Array.isArray(v) ? v : []);

const TABS = [
  { key: "overview", label: "Overview", icon: TrendingUp },
  { key: "orders", label: "Orders", icon: FileText },
  { key: "vehicles", label: "Vehicles", icon: Truck },
  { key: "customers", label: "Customers", icon: Users },
];

const ORDER_STATUS_STYLES = {
  "Pending Approval": "bg-amber-50 text-amber-700 border-amber-200",
  Approved: "bg-blue-50 text-blue-700 border-blue-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
  "Billing in Progress": "bg-sky-50 text-sky-700 border-sky-200",
  Billed: "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Ready to Dispatch": "bg-purple-50 text-purple-700 border-purple-200",
  Dispatched: "bg-orange-50 text-orange-700 border-orange-200",
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-block px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-full border ${ORDER_STATUS_STYLES[status] || "bg-slate-50 text-slate-600 border-slate-200"}`}
  >
    {status || "Pending"}
  </span>
);

const InfoRow = ({ icon: Icon, label, value, mono }) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
    {Icon && (
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
        <Icon size={14} className="text-slate-500" />
      </div>
    )}
    <div className="flex-1 min-w-0">
      <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-0.5">
        {label}
      </p>
      <p
        className={`text-sm text-slate-800 font-medium break-words ${mono ? "font-mono text-xs" : ""}`}
      >
        {value || "—"}
      </p>
    </div>
  </div>
);

const StatCard = ({ icon: Icon, label, value, color = "blue", sub }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors[color]}`}
        >
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-500 mb-0.5">{label}</p>
          <p className="text-xl font-bold text-slate-800 leading-tight">
            {value}
          </p>
          {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
        </div>
      </div>
    </Card>
  );
};

// ── Order Detail Modal ──
const OrderDetailModal = ({ order, onClose }) => {
  if (!order) return null;
  const o = order;
  const gst = gstBreakdown(o.totalAmount);

  const Row = ({ label, value, mono }) => (
    <div className="flex justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span
        className={`text-sm text-slate-800 font-medium text-right ${mono ? "font-mono text-xs" : ""}`}
      >
        {value || "—"}
      </span>
    </div>
  );

  return (
    <Modal
      open={!!order}
      onClose={onClose}
      title="Order Details"
      maxWidth="max-w-2xl"
    >
      <div className="flex items-start justify-between mb-5 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText size={16} className="text-blue-600" />
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Order
            </span>
          </div>
          <p className="text-lg font-bold text-slate-800 font-mono">
            {o.orderNumber}
          </p>
          {o.chassisNumber && (
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Chassis: {o.chassisNumber}
            </p>
          )}
        </div>
        <StatusBadge status={o.status} />
      </div>

      <h3 className="text-sm font-bold text-slate-800 mb-2">
        Vehicle Specification
      </h3>
      <div className="grid sm:grid-cols-2 gap-x-6 mb-5">
        <Row label="Vehicle Type" value={o.vehicleType} />
        <Row label="Model" value={o.modelName} />
        <Row label="Body Type" value={o.bodyTypeName} />
        <Row label="Color" value={o.colorName} />
        <Row label="Battery" value={o.batteryType} />
        <Row
          label="Specs"
          value={[
            o.batteryVolt && `${o.batteryVolt}V`,
            o.batteryAmpereHours && `${o.batteryAmpereHours}Ah`,
          ]
            .filter(Boolean)
            .join(" / ")}
        />
      </div>

      <h3 className="text-sm font-bold text-slate-800 mb-2">Price Breakdown</h3>
      <div className="bg-slate-50 rounded-lg p-4">
        <Row label="Model Price" value={formatINR(o.modelPrice)} />
        <Row label="Body Type Price" value={formatINR(o.bodyTypePrice)} />
        <Row label="Battery Price" value={formatINR(o.batteryPrice)} />
        <div className="my-2 border-t border-slate-200" />
        <Row label="Subtotal (excl. GST)" value={formatINR(gst.subtotal)} />
        <Row label="CGST (2.5%)" value={formatINR(gst.cgst)} />
        <Row label="SGST (2.5%)" value={formatINR(gst.sgst)} />
        <div className="my-2 border-t-2 border-slate-300" />
        <div className="flex justify-between py-2">
          <span className="text-sm font-bold text-slate-800">Total Amount</span>
          <span className="text-lg font-bold text-blue-600">
            {formatINR(o.totalAmount)}
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-slate-200">
        <button
          onClick={onClose}
          className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

// ── Main Component ──
const DealerDetails = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const {
    data: dealerData,
    loading: dealerLoading,
    error: dealerError,
    reload,
  } = useDealer(id);
  const { data: ordersData } = useOrders();
  const { data: customersData } = useCustomers();
  const { data: vehiclesData } = useVehicles();

  const dealer = dealerData;
  const allOrders = toArray(ordersData);
  const allCustomers = toArray(customersData);
  const allVehicles = toArray(vehiclesData);

  const dealerCode = dealer?.dealerCode;

  // Filter by dealer
  const orders = useMemo(
    () => allOrders.filter((o) => o.dealerCode === dealerCode),
    [allOrders, dealerCode],
  );
  const customers = useMemo(
    () => allCustomers.filter((c) => c.dealerCode === dealerCode),
    [allCustomers, dealerCode],
  );
  const vehicles = useMemo(
    () => allVehicles.filter((v) => v.dealerCode === dealerCode),
    [allVehicles, dealerCode],
  );

  const stats = useMemo(() => {
    const delivered = orders.filter((o) => o.status === "Delivered");
    const totalValue = delivered.reduce(
      (s, o) => s + (Number(o.totalAmount) || 0),
      0,
    );
    return {
      totalOrders: orders.length,
      delivered: delivered.length,
      totalCustomers: customers.length,
      totalValue,
    };
  }, [orders, customers]);

  const filterFn = (item, fields) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return fields.some((f) => item[f]?.toString().toLowerCase().includes(term));
  };

  const filteredOrders = useMemo(
    () =>
      orders.filter((o) =>
        filterFn(o, [
          "orderNumber",
          "chassisNumber",
          "modelName",
          "bodyTypeName",
          "status",
        ]),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orders, search],
  );

  const filteredCustomers = useMemo(
    () =>
      customers.filter((c) =>
        filterFn(c, [
          "name",
          "mobileNumber",
          "emailId",
          "chassisNumber",
          "dist",
          "state",
        ]),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customers, search],
  );

  const filteredVehicles = useMemo(
    () =>
      vehicles.filter((v) =>
        filterFn(v, ["chassisNumber", "modelName", "colorName"]),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vehicles, search],
  );

  const orderPagination = usePagination(filteredOrders, 25);
  const customerPagination = usePagination(filteredCustomers, 25);
  const vehiclePagination = usePagination(filteredVehicles, 25);

  const orderColumns = useMemo(
    () => [
      {
        key: "orderNumber",
        label: "Order #",
        className: "font-mono text-xs",
      },
      {
        key: "chassisNumber",
        label: "Chassis No.",
        className: "font-mono text-xs",
        render: (row) =>
          row.chassisNumber ? (
            <span className="font-mono text-xs">{row.chassisNumber}</span>
          ) : (
            <span className="text-slate-400 italic text-xs">—</span>
          ),
      },
      { key: "modelName", label: "Model" },
      { key: "bodyTypeName", label: "Body" },
      {
        key: "totalAmount",
        label: "Amount",
        render: (r) => (
          <span className="font-semibold">{formatINR(r.totalAmount)}</span>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (r) => <StatusBadge status={r.status} />,
      },
      {
        key: "actions",
        label: "",
        render: (r) => (
          <button
            onClick={() => setSelectedOrder(r)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            <Eye size={16} />
          </button>
        ),
      },
    ],
    [],
  );

  const customerColumns = useMemo(
    () => [
      { key: "name", label: "Name" },
      { key: "mobileNumber", label: "Mobile" },
      { key: "emailId", label: "Email" },
      {
        key: "chassisNumber",
        label: "Chassis No.",
        className: "font-mono text-xs",
      },
      { key: "dist", label: "District" },
      { key: "state", label: "State" },
    ],
    [],
  );

  const vehicleColumns = useMemo(
    () => [
      {
        key: "chassisNumber",
        label: "Chassis No.",
        className: "font-mono text-xs",
        render: (row) =>
          row.chassisNumber ? (
            <span className="font-mono text-xs">{row.chassisNumber}</span>
          ) : (
            <span className="text-slate-400 italic text-xs">—</span>
          ),
      },
      { key: "modelName", label: "Model" },
      { key: "bodyTypeName", label: "Body" },
      { key: "colorName", label: "Color" },
      {
        key: "isUsed",
        label: "Used",
        render: (r) =>
          r.isUsed === true ? (
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-orange-50 text-orange-600 border border-orange-200">
              Yes
            </span>
          ) : (
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-green-50 text-green-600 border border-green-200">
              No
            </span>
          ),
      },
    ],
    [],
  );

  if (dealerLoading) {
    return (
      <section className="w-full">
        <LoadingCard rows={8} />
      </section>
    );
  }

  if (dealerError || !dealer) {
    return (
      <section className="w-full">
        <ErrorCard
          message={
            dealerError || "Dealer not found. Please check the dealer ID."
          }
          onRetry={reload}
        />
        <div className="mt-4 flex justify-center">
          <Link
            to="/dealerInfo"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
          >
            <ArrowLeft size={14} /> Back to Dealers
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full">
      <Link
        to="/dealerInfo"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4"
      >
        <ArrowLeft size={15} /> Back to Dealers
      </Link>

      {/* Header */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
            <User size={28} className="text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-slate-800">
                {dealer.name || "Unnamed Dealer"}
              </h1>
              {dealer.activationCode ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-green-50 text-green-700 border border-green-200">
                  <CheckCircle2 size={10} /> Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                  <Clock size={10} /> Pending
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              {dealer.dealerCode && (
                <span className="font-mono font-medium text-blue-600">
                  {dealer.dealerCode}
                </span>
              )}
              {dealer.gstin && (
                <span className="font-mono text-xs">GSTIN: {dealer.gstin}</span>
              )}
            </div>
          </div>

          {dealer.activationCode && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shrink-0">
              <div className="flex items-center gap-1.5 mb-1">
                <Key size={12} className="text-slate-500" />
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                  Activation Code
                </span>
              </div>
              <p className="font-mono font-bold text-slate-800">
                {dealer.activationCode}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={FileText}
          label="Total Orders"
          value={stats.totalOrders}
          color="blue"
        />
        <StatCard
          icon={Package}
          label="Delivered"
          value={stats.delivered}
          color="green"
        />
        <StatCard
          icon={Users}
          label="Customers"
          value={stats.totalCustomers}
          color="purple"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Value"
          value={formatINR(stats.totalValue)}
          color="orange"
          sub="from delivered"
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setSearch("");
              }}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <User size={16} className="text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-800">Contact Information</h3>
            </div>
            <InfoRow icon={User} label="Contact Name" value={dealer.name} />
            <InfoRow icon={Phone} label="Mobile" value={dealer.mobileNo} />
            <InfoRow icon={Mail} label="Email" value={dealer.emailId} />
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <Building2 size={16} className="text-purple-600" />
              </div>
              <h3 className="font-bold text-slate-800">Business Information</h3>
            </div>
            <InfoRow
              icon={Key}
              label="Dealer Code"
              value={dealer.dealerCode}
              mono
            />
            <InfoRow icon={Key} label="GSTIN" value={dealer.gstin} mono />
            <InfoRow
              icon={Key}
              label="Activation Code"
              value={dealer.activationCode}
              mono
            />
            <InfoRow
              icon={Key}
              label="LOI Reference"
              value={dealer.LOIreferenceId}
              mono
            />
            <InfoRow
              icon={Key}
              label="RQ Reference"
              value={dealer.RQreferenceId}
              mono
            />
          </Card>

          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <MapPin size={16} className="text-green-600" />
              </div>
              <h3 className="font-bold text-slate-800">Location & RTO</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-8">
              <div>
                <InfoRow icon={MapPin} label="Address" value={dealer.address} />
                <InfoRow icon={MapPin} label="District" value={dealer.dist} />
                <InfoRow icon={MapPin} label="State" value={dealer.state} />
                <InfoRow
                  icon={MapPin}
                  label="Pin Code"
                  value={dealer.pinCode}
                />
              </div>
              <div>
                <InfoRow
                  icon={Building2}
                  label="RTO Office"
                  value={dealer.rtoOffice}
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Other tabs */}
      {activeTab !== "overview" && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="relative w-full sm:max-w-sm">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="!pl-10"
              />
            </div>
            <p className="text-xs text-slate-500">
              {activeTab === "orders" && `${filteredOrders.length} orders`}
              {activeTab === "customers" &&
                `${filteredCustomers.length} customers`}
              {activeTab === "vehicles" &&
                `${filteredVehicles.length} vehicles`}
            </p>
          </div>

          {activeTab === "orders" && (
            <>
              <DataTable
                columns={orderColumns}
                rows={orderPagination.pageItems}
                rowKey={(r) => r.id ?? r.orderNumber}
                emptyText={
                  orders.length === 0
                    ? "No orders yet."
                    : "No orders match your search."
                }
              />
              <Pagination
                page={orderPagination.page}
                pageSize={orderPagination.pageSize}
                total={orderPagination.total}
                onPageChange={orderPagination.setPage}
                onPageSizeChange={orderPagination.setPageSize}
              />
            </>
          )}

          {activeTab === "customers" && (
            <>
              <DataTable
                columns={customerColumns}
                rows={customerPagination.pageItems}
                rowKey={(r) => r.id ?? r.chassisNumber}
                emptyText={
                  customers.length === 0
                    ? "No customers registered yet."
                    : "No customers match your search."
                }
              />
              <Pagination
                page={customerPagination.page}
                pageSize={customerPagination.pageSize}
                total={customerPagination.total}
                onPageChange={customerPagination.setPage}
                onPageSizeChange={customerPagination.setPageSize}
              />
            </>
          )}

          {activeTab === "vehicles" && (
            <>
              <DataTable
                columns={vehicleColumns}
                rows={vehiclePagination.pageItems}
                rowKey={(r) => r.id ?? r.chassisNumber}
                emptyText={
                  vehicles.length === 0
                    ? "No vehicles registered yet."
                    : "No vehicles match your search."
                }
              />
              <Pagination
                page={vehiclePagination.page}
                pageSize={vehiclePagination.pageSize}
                total={vehiclePagination.total}
                onPageChange={vehiclePagination.setPage}
                onPageSizeChange={vehiclePagination.setPageSize}
              />
            </>
          )}
        </>
      )}

      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </section>
  );
};

export default DealerDetails;
