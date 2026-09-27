import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  X,
  LayoutGrid,
  List,
  Building2,
  Package,
  Eye,
  CheckCircle2,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  Home,
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { ROLE_DASH, ROLE_LABEL } from "../../auth/roleConfig";
import DataTable from "../../components/ui/DataTable";
import Modal from "../../components/ui/Modal";
import Card from "../../components/ui/Card";
import Pagination from "../../components/ui/Pagination";
import FilterSelect from "../../components/ui/FilterSelect";
import { ErrorCard, LoadingCard } from "../../components/ui/AsyncStates";
import { formatINR } from "../../features/quotation/calc";
import { useDeliveries } from "../../hooks/useDelivery";
import usePagination from "../../hooks/usePagination";

// ── Delivery Detail Modal ──
const DeliveryDetailModal = ({ delivery, onClose }) => {
  if (!delivery) return null;
  const d = delivery;

  const Row = ({ label, value, mono, icon: Icon }) => (
    <div className="flex justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-500 flex items-center gap-1.5">
        {Icon && <Icon size={12} className="text-slate-400" />}
        {label}
      </span>
      <span
        className={`text-sm text-slate-800 font-medium text-right ${mono ? "font-mono text-xs" : ""}`}
      >
        {value || "—"}
      </span>
    </div>
  );

  return (
    <Modal
      open={!!delivery}
      onClose={onClose}
      title="Delivery Details"
      maxWidth="max-w-3xl"
    >
      <div className="flex items-start justify-between mb-5 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package size={16} className="text-blue-600" />
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Delivered to Customer
            </span>
          </div>
          <p className="text-lg font-bold text-slate-800 font-mono">
            {d.chassisNumber || "—"}
          </p>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          Delivered
        </span>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-xl p-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">
              Vehicle Successfully Delivered
            </p>
            <p className="text-xs text-slate-600">
              To: {d.customerName} · {d.customerMobile}
            </p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-x-6 mb-5">
        <Row label="Bill Number" value={d.billNumber} mono />
        <Row label="Delivered On" value={d.deliveredOn} icon={Calendar} />
        <Row label="Warranty" value={`${d.warrantyStart} → ${d.warrantyEnd}`} />
      </div>

      <h3 className="text-sm font-bold text-slate-800 mb-2">
        Customer Information
      </h3>
      <div className="grid sm:grid-cols-2 gap-x-6 mb-5">
        <Row label="Customer Name" value={d.customerName} icon={User} />
        <Row label="Mobile" value={d.customerMobile} icon={Phone} />
        <Row label="Email" value={d.customerEmail} icon={Mail} />
        <Row label="Pin Code" value={d.customerPinCode} />
        <div className="sm:col-span-2">
          <Row
            label="Delivery Address"
            value={[
              d.customerAddress,
              d.customerDistrict,
              d.customerState,
              d.customerPinCode,
            ]
              .filter(Boolean)
              .join(", ")}
            icon={Home}
          />
        </div>
      </div>

      <h3 className="text-sm font-bold text-slate-800 mb-2">
        Dealer Information
      </h3>
      <div className="grid sm:grid-cols-2 gap-x-6 mb-5">
        <Row label="Dealer Name" value={d.dealerName} />
        <Row label="Dealer Code" value={d.dealerCode} mono />
        <Row label="State" value={d.dealerState} />
        <Row label="District" value={d.dealerDistrict} />
      </div>

      <h3 className="text-sm font-bold text-slate-800 mb-2">Vehicle Details</h3>
      <div className="grid sm:grid-cols-2 gap-x-6 mb-5">
        <Row label="Vehicle Type" value={d.vehicleType} />
        <Row label="Brand" value={d.brandPrefix} />
        <Row label="Model" value={d.modelName} />
        <Row label="Body Type" value={d.bodyTypeName} />
        <Row label="Color" value={d.colorName} />
        <Row label="Chassis Number" value={d.chassisNumber} mono />
      </div>

      <div className="bg-slate-50 rounded-lg p-4 flex justify-between items-center">
        <span className="text-sm font-bold text-slate-800">Invoice Amount</span>
        <span className="text-xl font-bold text-blue-600">
          {formatINR(d.totalAmount)}
        </span>
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
const Delivery = () => {
  const { role } = useAuth();
  const isDealer = role === "dealer";
  const isAdmin = role === "admin";

  const [dealerFilter, setDealerFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [selectedItem, setSelectedItem] = useState(null);

  const { data, loading, error } = useDeliveries();
  const list = data ?? [];

  // Dealer map
  const dealerMap = useMemo(() => {
    const map = {};
    list.forEach((d) => {
      if (d.dealerCode && !map[d.dealerCode]) {
        map[d.dealerCode] = d.dealerName || "Unknown";
      }
    });
    return map;
  }, [list]);

  // Dealer options
  const dealerOptions = useMemo(() => {
    if (isDealer) return [];
    const codes = [
      ...new Set(list.map((d) => d.dealerCode).filter(Boolean)),
    ].sort();
    return [
      { value: "all", label: "All Dealers" },
      ...codes.map((code) => ({
        value: code,
        label: `${dealerMap[code]} (${code})`,
      })),
    ];
  }, [list, isDealer, dealerMap]);

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "rikshaw", label: "Rikshaw" },
    { value: "cargo", label: "Cargo / Loader" },
  ];

  const filtered = useMemo(() => {
    return list.filter((d) => {
      if (!isDealer && dealerFilter !== "all" && d.dealerCode !== dealerFilter)
        return false;
      if (typeFilter !== "all") {
        const v = String(d.vehicleType || "").toLowerCase();
        if (
          typeFilter === "rikshaw" &&
          !v.includes("rikshaw") &&
          !v.includes("rickshaw")
        )
          return false;
        if (
          typeFilter === "cargo" &&
          !v.includes("cargo") &&
          !v.includes("loader")
        )
          return false;
      }
      return true;
    });
  }, [list, dealerFilter, typeFilter, isDealer]);

  // Group by dealer
  const groupedByDealer = useMemo(() => {
    const groups = {};
    filtered.forEach((d) => {
      const key = d.dealerCode || "UNKNOWN";
      if (!groups[key]) {
        groups[key] = {
          dealerCode: key,
          dealerName: d.dealerName || "Unknown",
          dealerState: d.dealerState,
          dealerDistrict: d.dealerDistrict,
          deliveries: [],
          totalValue: 0,
        };
      }
      groups[key].deliveries.push(d);
      groups[key].totalValue += Number(d.totalAmount) || 0;
    });
    return Object.values(groups).sort((a, b) =>
      a.dealerName.localeCompare(b.dealerName),
    );
  }, [filtered]);

  const pagination = usePagination(filtered, 25);

  const hasActiveFilters = dealerFilter !== "all" || typeFilter !== "all";

  const clearFilters = () => {
    setDealerFilter("all");
    setTypeFilter("all");
    pagination.reset();
  };

  const stats = useMemo(() => {
    return {
      total: list.length,
      rikshaw: list.filter((d) =>
        String(d.vehicleType || "")
          .toLowerCase()
          .includes("rikshaw"),
      ).length,
      cargo: list.filter(
        (d) =>
          String(d.vehicleType || "")
            .toLowerCase()
            .includes("cargo") ||
          String(d.vehicleType || "")
            .toLowerCase()
            .includes("loader"),
      ).length,
      totalValue: list.reduce(
        (sum, d) => sum + (Number(d.totalAmount) || 0),
        0,
      ),
    };
  }, [list]);

  const columns = useMemo(
    () => [
      {
        key: "chassisNumber",
        label: "Chassis No.",
        className: "font-mono text-xs",
      },
      ...(isDealer
        ? []
        : [
            {
              key: "dealerName",
              label: "Dealer",
              render: (row) => (
                <div>
                  <p className="font-medium text-slate-800 text-xs">
                    {row.dealerName || "—"}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {row.dealerCode}
                  </p>
                </div>
              ),
            },
          ]),
      {
        key: "customerName",
        label: "Customer",
        render: (row) => (
          <div>
            <p className="font-medium text-slate-800 text-xs">
              {row.customerName || "—"}
            </p>
            {row.customerMobile && (
              <p className="text-[10px] text-slate-500">{row.customerMobile}</p>
            )}
          </div>
        ),
      },
      { key: "modelName", label: "Model" },
      { key: "colorName", label: "Color" },
      {
        key: "totalAmount",
        label: "Amount",
        render: (row) => (
          <span className="font-semibold text-slate-800">
            {formatINR(row.totalAmount)}
          </span>
        ),
      },
      {
        key: "deliveredOn",
        label: "Delivered",
        render: (row) => (
          <span className="text-xs text-slate-500">{row.deliveredOn}</span>
        ),
      },
      {
        key: "actions",
        label: "",
        render: (row) => (
          <button
            onClick={() => setSelectedItem(row)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            aria-label="View delivery details"
          >
            <Eye size={16} />
          </button>
        ),
      },
    ],
    [isDealer],
  );

  return (
    <>
      <section className="w-full">
        <Link
          to={ROLE_DASH[role] || "/adminDash"}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4"
        >
          <ArrowLeft size={15} /> Back to dashboard
        </Link>

        <div className="mb-6">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            {ROLE_LABEL[role]} · Operations
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            {isDealer ? "My Deliveries" : "Delivery Overview"}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isDealer
              ? "Vehicles delivered from your dealership to customers."
              : "All vehicles delivered to end customers. Filter by dealer or view grouped."}
          </p>
        </div>

        {loading ? (
          <LoadingCard />
        ) : error ? (
          <ErrorCard message={error} />
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Package size={14} className="text-blue-600" />
                  <p className="text-xs text-slate-500">Total Delivered</p>
                </div>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.total}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-slate-500 mb-1">Rikshaw</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.rikshaw}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-slate-500 mb-1">Cargo / Loader</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.cargo}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-slate-500 mb-1">Total Value</p>
                <p className="text-2xl font-bold text-slate-800">
                  {formatINR(stats.totalValue)}
                </p>
              </Card>
            </div>

            {/* Filters + View toggle */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4 flex-wrap">
              {isAdmin && (
                <FilterSelect
                  label="Filter by dealer"
                  value={dealerFilter}
                  onChange={(v) => {
                    setDealerFilter(v);
                    pagination.reset();
                  }}
                  options={dealerOptions}
                  className="w-full lg:w-64"
                />
              )}
              <FilterSelect
                label="Filter by vehicle type"
                value={typeFilter}
                onChange={(v) => {
                  setTypeFilter(v);
                  pagination.reset();
                }}
                options={typeOptions}
                className="w-full lg:w-48"
              />

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 px-3 py-2.5 rounded-lg hover:bg-red-50 transition-colors w-fit"
                >
                  <X size={13} />
                  Clear filters
                </button>
              )}

              <div className="inline-flex rounded-lg border border-slate-300 bg-white p-1 ml-auto">
                <button
                  onClick={() => setViewMode("table")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    viewMode === "table"
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <List size={12} />
                  Table
                </button>
                <button
                  onClick={() => setViewMode("grouped")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    viewMode === "grouped"
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <LayoutGrid size={12} />
                  By Dealer
                </button>
              </div>
            </div>

            {/* TABLE VIEW */}
            {viewMode === "table" && (
              <>
                <DataTable
                  columns={columns}
                  rows={pagination.pageItems}
                  rowKey={(row) => row.id ?? row.chassisNumber}
                  emptyText={
                    hasActiveFilters
                      ? "No deliveries match your filters."
                      : "No deliveries yet."
                  }
                />

                <Pagination
                  page={pagination.page}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  onPageChange={pagination.setPage}
                  onPageSizeChange={pagination.setPageSize}
                />
              </>
            )}

            {/* GROUPED VIEW */}
            {viewMode === "grouped" && (
              <div className="space-y-4">
                {groupedByDealer.length === 0 ? (
                  <Card className="p-12 text-center">
                    <p className="text-slate-600 font-medium">
                      No deliveries found.
                    </p>
                  </Card>
                ) : (
                  groupedByDealer.map((group) => (
                    <Card
                      key={group.dealerCode}
                      className="overflow-hidden border-slate-200/80"
                    >
                      <div className="px-4 sm:px-5 py-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                            <Building2 size={16} className="text-white" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-900 truncate">
                              {group.dealerName}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              {group.dealerCode} · {group.dealerDistrict},{" "}
                              {group.dealerState}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200">
                            <Package size={11} className="text-blue-600" />
                            <span className="text-xs font-black text-blue-700 tabular">
                              {group.deliveries.length}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200">
                            <span className="text-xs font-black text-emerald-700 tabular">
                              {formatINR(group.totalValue)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3">
                        <DataTable
                          columns={columns.filter(
                            (c) => c.key !== "dealerName",
                          )}
                          rows={group.deliveries}
                          rowKey={(row) => row.id ?? row.chassisNumber}
                          emptyText="No deliveries for this dealer."
                        />
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </section>

      <DeliveryDetailModal
        delivery={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
};

export default Delivery;
