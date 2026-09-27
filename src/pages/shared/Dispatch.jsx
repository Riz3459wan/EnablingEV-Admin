import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  X,
  LayoutGrid,
  List,
  Building2,
  Truck,
  Eye,
  CheckCircle2,
  Calendar,
  MapPin,
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
import { useOrders } from "../../hooks/useOrders";
import usePagination from "../../hooks/usePagination";

// ── Dispatch Detail Modal ──
const DispatchDetailModal = ({ order, onClose }) => {
  if (!order) return null;
  const q = order;

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
      open={!!order}
      onClose={onClose}
      title="Dispatch Details"
      maxWidth="max-w-2xl"
    >
      <div className="flex items-start justify-between mb-5 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Truck size={16} className="text-green-600" />
            <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">
              Dispatched to Dealer
            </span>
          </div>
          <p className="text-lg font-bold text-slate-800 font-mono">
            {q.chassisNumber || "—"}
          </p>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
          Dispatched
        </span>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">
              Vehicle Dispatched via {q.dispatchMode}
            </p>
            <p className="text-xs text-slate-600">To: {q.dealerName}</p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-6 mb-5">
        <Row label="Bill Number" value={q.billNumber} mono />
        <Row label="Dispatched On" value={q.dispatchedOn} icon={Calendar} />
        <Row label="Dispatch Mode" value={q.dispatchMode} icon={Truck} />
        {q.transportDetails && (
          <>
            <Row label="Transport Name" value={q.transportDetails.name} />
            <Row label="Transport Contact" value={q.transportDetails.contact} />
          </>
        )}
      </div>

      <h3 className="text-sm font-bold text-slate-800 mb-2">
        Dealer Information
      </h3>
      <div className="grid sm:grid-cols-2 gap-x-6 mb-5">
        <Row label="Dealer Name" value={q.dealerName} />
        <Row label="Dealer Code" value={q.dealerCode} mono />
        <Row label="GSTIN" value={q.dealerGstin} mono />
        <div className="sm:col-span-2">
          <Row
            label="Delivery Address"
            value={[
              q.dealerAddress,
              q.dealerDistrict,
              q.dealerState,
              q.dealerPinCode,
            ]
              .filter(Boolean)
              .join(", ")}
            icon={MapPin}
          />
        </div>
      </div>

      <h3 className="text-sm font-bold text-slate-800 mb-2">Vehicle Details</h3>
      <div className="grid sm:grid-cols-2 gap-x-6 mb-5">
        <Row label="Vehicle Type" value={q.vehicleType} />
        <Row label="Brand" value={q.brandPrefix} />
        <Row label="Model" value={q.modelName} />
        <Row label="Body Type" value={q.bodyTypeName} />
        <Row label="Color" value={q.colorName} />
        <Row label="Chassis Number" value={q.chassisNumber} mono />
      </div>

      <div className="bg-slate-50 rounded-lg p-4 flex justify-between items-center">
        <span className="text-sm font-bold text-slate-800">Invoice Amount</span>
        <span className="text-xl font-bold text-green-600">
          {formatINR(q.totalAmount)}
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
const Dispatch = () => {
  const { role } = useAuth();
  const isDealer = role === "dealer";
  const isAdmin = role === "admin";

  const [dealerFilter, setDealerFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [selectedItem, setSelectedItem] = useState(null);

  const { data, loading, error } = useOrders();

  const allOrders = data ?? [];

  // ✅ Only Dispatched orders
  const list = useMemo(
    () => allOrders.filter((o) => o.status === "Dispatched"),
    [allOrders],
  );

  const dealerMap = useMemo(() => {
    const map = {};
    list.forEach((d) => {
      if (d.dealerCode && !map[d.dealerCode]) {
        map[d.dealerCode] = d.dealerName || "Unknown";
      }
    });
    return map;
  }, [list]);

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

  const modeOptions = [
    { value: "all", label: "All Modes" },
    { value: "Self", label: "Self" },
    { value: "Transport", label: "Transport" },
  ];

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "rikshaw", label: "Rikshaw" },
    { value: "cargo", label: "Cargo / Loader" },
  ];

  const filtered = useMemo(() => {
    return list.filter((d) => {
      if (!isDealer && dealerFilter !== "all" && d.dealerCode !== dealerFilter)
        return false;
      if (modeFilter !== "all" && d.dispatchMode !== modeFilter) return false;
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
  }, [list, dealerFilter, modeFilter, typeFilter, isDealer]);

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
          items: [],
          totalValue: 0,
        };
      }
      groups[key].items.push(d);
      groups[key].totalValue += Number(d.totalAmount) || 0;
    });
    return Object.values(groups).sort((a, b) =>
      a.dealerName.localeCompare(b.dealerName),
    );
  }, [filtered]);

  const pagination = usePagination(filtered, 25);

  const hasActiveFilters =
    dealerFilter !== "all" || modeFilter !== "all" || typeFilter !== "all";

  const clearFilters = () => {
    setDealerFilter("all");
    setModeFilter("all");
    setTypeFilter("all");
    pagination.reset();
  };

  const stats = useMemo(() => {
    const selfCount = list.filter((d) => d.dispatchMode === "Self").length;
    const transportCount = list.filter(
      (d) => d.dispatchMode === "Transport",
    ).length;
    const totalValue = list.reduce(
      (s, d) => s + (Number(d.totalAmount) || 0),
      0,
    );
    return {
      total: list.length,
      selfCount,
      transportCount,
      totalValue,
    };
  }, [list]);

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
      { key: "modelName", label: "Model" },
      { key: "colorName", label: "Color" },
      {
        key: "dispatchMode",
        label: "Mode",
        render: (row) =>
          row.dispatchMode ? (
            <span
              className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border ${
                row.dispatchMode === "Self"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }`}
            >
              {row.dispatchMode}
            </span>
          ) : (
            <span className="text-slate-400 italic text-xs">—</span>
          ),
      },
      {
        key: "dispatchedOn",
        label: "Dispatched",
        render: (row) => (
          <span className="text-xs text-slate-500">
            {row.dispatchedOn || "—"}
          </span>
        ),
      },
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
        key: "actions",
        label: "",
        render: (row) => (
          <button
            onClick={() => setSelectedItem(row)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            aria-label="View dispatch details"
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
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">
            {ROLE_LABEL[role]} · Operations
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            {isDealer ? "My Dispatches" : "Dispatch Overview"}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isDealer
              ? "Vehicles dispatched to your dealership."
              : "All vehicles dispatched from factory to dealers."}
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
                  <Truck size={14} className="text-green-600" />
                  <p className="text-xs text-slate-500">Total Dispatched</p>
                </div>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.total}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-emerald-600 mb-1">Self</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {stats.selfCount}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-blue-600 mb-1">Transport</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.transportCount}
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
                  label="Dealer"
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
                label="Mode"
                value={modeFilter}
                onChange={(v) => {
                  setModeFilter(v);
                  pagination.reset();
                }}
                options={modeOptions}
                className="w-full lg:w-40"
              />
              <FilterSelect
                label="Type"
                value={typeFilter}
                onChange={(v) => {
                  setTypeFilter(v);
                  pagination.reset();
                }}
                options={typeOptions}
                className="w-full lg:w-44"
              />

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 px-3 py-2.5 rounded-lg hover:bg-red-50 transition-colors w-fit"
                >
                  <X size={13} />
                  Clear
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

            <p className="text-xs text-slate-500 mb-4">
              Showing {pagination.total}{" "}
              {pagination.total === 1 ? "dispatch" : "dispatches"}
            </p>

            {/* TABLE VIEW */}
            {viewMode === "table" && (
              <>
                <DataTable
                  columns={columns}
                  rows={pagination.pageItems}
                  rowKey={(row) => row.id ?? row.orderNumber}
                  emptyText={
                    hasActiveFilters
                      ? "No dispatches match your filters."
                      : "No dispatched vehicles yet."
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
                      No dispatches found.
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
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
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
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-50 border border-green-200">
                            <Truck size={11} className="text-green-600" />
                            <span className="text-xs font-black text-green-700 tabular">
                              {group.items.length}
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
                          rows={group.items}
                          rowKey={(row) => row.id ?? row.orderNumber}
                          emptyText="No dispatches for this dealer."
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

      <DispatchDetailModal
        order={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
};

export default Dispatch;
