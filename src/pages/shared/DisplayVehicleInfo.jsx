import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  X,
  LayoutGrid,
  List,
  Building2,
  Car,
  Eye,
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { ROLE_DASH, ROLE_LABEL } from "../../auth/roleConfig";
import DataTable from "../../components/ui/DataTable";
import Pagination from "../../components/ui/Pagination";
import FilterSelect from "../../components/ui/FilterSelect";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import { ErrorCard, LoadingCard } from "../../components/ui/AsyncStates";
import { useDealerVehicleSummary } from "../../hooks/useVehicles";
import { useDealers } from "../../hooks/useDealers";
import usePagination from "../../hooks/usePagination";

const UsedBadge = ({ value }) => {
  if (value === null || value === undefined)
    return <span className="text-slate-400">—</span>;
  return value ? (
    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
      Yes
    </span>
  ) : (
    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200">
      No
    </span>
  );
};

// ── Dealer Vehicles Modal ──
const DealerVehiclesModal = ({ dealer, onClose }) => {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");

  const vehicles = dealer?.vehicles || [];

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return vehicles.filter((v) => {
      if (stageFilter !== "all" && v._stage !== stageFilter) return false;
      if (!term) return true;
      return [
        v.chassisNumber,
        v.modelName,
        v.bodyTypeName,
        v.colorName,
        v.customerName,
      ].some((f) => f?.toString().toLowerCase().includes(term));
    });
  }, [vehicles, search, stageFilter]);

  const pagination = usePagination(filtered, 25);

  const hasActiveFilters = stageFilter !== "all" || search.trim().length > 0;

  const clearFilters = () => {
    setSearch("");
    setStageFilter("all");
    pagination.reset();
  };

  const stageOptions = [
    { value: "all", label: "All Stages" },
    { value: "with_dealer", label: "With Dealer (In Stock)" },
    { value: "sold", label: "Sold to Customer" },
  ];

  const columns = useMemo(
    () => [
      {
        key: "chassisNumber",
        label: "Chassis No.",
        className: "font-mono text-xs",
      },
      { key: "modelName", label: "Model" },
      { key: "bodyTypeName", label: "Body" },
      { key: "colorName", label: "Color" },
      {
        key: "_stage",
        label: "Stage",
        render: (row) =>
          row._stage === "sold" ? (
            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Sold
            </span>
          ) : (
            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              In Stock
            </span>
          ),
      },
      {
        key: "customerName",
        label: "Customer",
        render: (row) =>
          row._stage === "sold" ? (
            <div>
              <p className="font-medium text-slate-800 text-xs">
                {row.customerName || "—"}
              </p>
              {row.customerMobile && (
                <p className="text-[10px] text-slate-500">
                  {row.customerMobile}
                </p>
              )}
            </div>
          ) : (
            <span className="text-slate-400 text-xs">—</span>
          ),
      },
    ],
    [],
  );

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={dealer?.dealerName || "Dealer Vehicles"}
      subtitle={`${dealer?.totalVehicles || 0} vehicles · ${dealer?.dealerCode || ""}`}
      maxWidth="max-w-4xl"
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">
            Total
          </p>
          <p className="text-xl font-black text-slate-800 tabular">
            {dealer?.totalVehicles || 0}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center">
          <p className="text-[10px] uppercase tracking-wider font-bold text-blue-700 mb-1">
            In Stock
          </p>
          <p className="text-xl font-black text-blue-700 tabular">
            {dealer?.inStock || 0}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-center">
          <p className="text-[10px] uppercase tracking-wider font-bold text-purple-700 mb-1">
            Dispatched
          </p>
          <p className="text-xl font-black text-purple-700 tabular">
            {dealer?.dispatched || 0}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
          <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 mb-1">
            Sold
          </p>
          <p className="text-xl font-black text-emerald-700 tabular">
            {dealer?.sold || 0}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
        <div className="relative w-full lg:max-w-sm">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              pagination.reset();
            }}
            placeholder="Search chassis, model, customer..."
            className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <FilterSelect
          label="Filter by stage"
          value={stageFilter}
          onChange={(v) => {
            setStageFilter(v);
            pagination.reset();
          }}
          options={stageOptions}
          className="w-full lg:w-56"
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
        <p className="text-xs text-slate-500 lg:ml-auto">
          Showing {pagination.total}{" "}
          {pagination.total === 1 ? "vehicle" : "vehicles"}
        </p>
      </div>

      <DataTable
        columns={columns}
        rows={pagination.pageItems}
        rowKey={(row) => row.id ?? row.chassisNumber}
        emptyText={
          hasActiveFilters
            ? "No vehicles match your filters."
            : "No vehicles for this dealer."
        }
      />

      <Pagination
        page={pagination.page}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />
    </Modal>
  );
};

// ── Main Component ──
const DisplayVehicleInfo = () => {
  const { role } = useAuth();
  const isDealer = role === "dealer";
  const isAdmin = role === "admin";

  const [stateFilter, setStateFilter] = useState("all");
  const [dealerFilter, setDealerFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [selectedDealer, setSelectedDealer] = useState(null);

  const { data, loading, error } = useDealerVehicleSummary();
  const { data: dealersData } = useDealers();

  const list = data ?? [];
  const dealers = dealersData ?? [];

  const stateOptions = useMemo(() => {
    const base =
      dealerFilter === "all"
        ? list
        : list.filter((d) => d.dealerCode === dealerFilter);
    const values = [
      ...new Set(base.map((d) => d.dealerState).filter(Boolean)),
    ].sort();
    return [
      { value: "all", label: "All States" },
      ...values.map((v) => ({ value: v, label: v })),
    ];
  }, [list, dealerFilter]);

  const dealerOptions = useMemo(() => {
    if (!isAdmin) return [];
    const values = [...new Set(list.map((d) => d.dealerCode).filter(Boolean))]
      .map((code) => {
        const dealer = list.find((d) => d.dealerCode === code);
        return {
          value: code,
          label: `${dealer?.dealerName || "Unknown"} (${code})`,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
    return [{ value: "all", label: "All Dealers" }, ...values];
  }, [list, isAdmin]);

  const filtered = useMemo(() => {
    return list.filter((d) => {
      if (dealerFilter !== "all" && d.dealerCode !== dealerFilter) return false;
      if (stateFilter !== "all" && d.dealerState !== stateFilter) return false;
      return true;
    });
  }, [list, dealerFilter, stateFilter]);

  const pagination = usePagination(filtered, 25);

  const hasActiveFilters = dealerFilter !== "all" || stateFilter !== "all";

  const clearFilters = () => {
    setDealerFilter("all");
    setStateFilter("all");
    pagination.reset();
  };

  const stats = useMemo(() => {
    return {
      totalDealers: list.length,
      totalVehicles: list.reduce((s, d) => s + d.totalVehicles, 0),
      totalInStock: list.reduce((s, d) => s + d.inStock, 0),
      totalSold: list.reduce((s, d) => s + d.sold, 0),
    };
  }, [list]);

  const columns = useMemo(
    () => [
      {
        key: "dealerName",
        label: "Dealer",
        render: (row) => (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <Building2 size={14} className="text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-slate-800">{row.dealerName}</p>
              <p className="text-[11px] text-slate-500 font-mono">
                {row.dealerCode}
              </p>
            </div>
          </div>
        ),
      },
      { key: "dealerState", label: "State" },
      { key: "dealerDistrict", label: "District" },
      {
        key: "totalVehicles",
        label: "Total",
        render: (row) => (
          <span className="font-bold text-slate-800 tabular">
            {row.totalVehicles}
          </span>
        ),
      },
      {
        key: "inStock",
        label: "In Stock",
        render: (row) => (
          <span className="inline-flex items-center gap-1 font-semibold text-blue-700 tabular">
            <Car size={12} />
            {row.inStock}
          </span>
        ),
      },
      {
        key: "dispatched",
        label: "Dispatched",
        render: (row) => (
          <span className="font-semibold text-purple-700 tabular">
            {row.dispatched}
          </span>
        ),
      },
      {
        key: "sold",
        label: "Sold",
        render: (row) => (
          <span className="font-semibold text-emerald-700 tabular">
            {row.sold}
          </span>
        ),
      },
      {
        key: "actions",
        label: "",
        render: (row) => (
          <button
            onClick={() => setSelectedDealer(row)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            aria-label={`View vehicles for ${row.dealerName}`}
          >
            <Eye size={16} />
          </button>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <section className="w-full">
        <Link
          to={ROLE_DASH[role] || "/"}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4"
        >
          <ArrowLeft size={15} /> Back to dashboard
        </Link>

        <div className="mb-6">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            {ROLE_LABEL[role]}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            {isDealer ? "My Vehicles" : "Vehicle Info"}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isDealer
              ? "Vehicles dispatched to your dealership."
              : "Dealer-wise vehicle summary. Click a dealer to see all their vehicles."}
          </p>
        </div>

        {loading ? (
          <LoadingCard rows={6} />
        ) : error ? (
          <ErrorCard message={error} />
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 size={14} className="text-slate-500" />
                  <p className="text-xs text-slate-500">Dealers</p>
                </div>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.totalDealers}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-slate-500 mb-1">Total Vehicles</p>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.totalVehicles}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-blue-600 mb-1">In Stock</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalInStock}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-emerald-600 mb-1">Sold</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {stats.totalSold}
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
                label="Filter by state"
                value={stateFilter}
                onChange={(v) => {
                  setStateFilter(v);
                  pagination.reset();
                }}
                options={stateOptions}
                className="w-full lg:w-56"
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
                  rowKey={(row) => row.dealerCode}
                  emptyText={
                    hasActiveFilters
                      ? "No dealers match your filters."
                      : "No dealers have vehicles yet."
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
                {filtered.length === 0 ? (
                  <Card className="p-12 text-center">
                    <p className="text-slate-600 font-medium">
                      No dealers found.
                    </p>
                  </Card>
                ) : (
                  filtered.map((dealer) => (
                    <Card
                      key={dealer.dealerCode}
                      className="overflow-hidden border-slate-200/80"
                    >
                      <div className="px-4 sm:px-5 py-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                            <Building2 size={16} className="text-white" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-900 truncate">
                              {dealer.dealerName}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              {dealer.dealerCode} · {dealer.dealerDistrict},{" "}
                              {dealer.dealerState}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedDealer(dealer)}
                          className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 border border-blue-200 hover:border-blue-600 transition-colors"
                        >
                          <span className="text-[10px] font-bold text-blue-700 group-hover:text-white uppercase tracking-wider">
                            View Vehicles
                          </span>
                          <Eye
                            size={11}
                            className="text-blue-700 group-hover:text-white"
                          />
                        </button>
                      </div>

                      {/* Mini stats row */}
                      <div className="grid grid-cols-4 divide-x divide-slate-100 border-b border-slate-100">
                        <div className="p-3 text-center">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                            Total
                          </p>
                          <p className="text-lg font-black text-slate-800 tabular">
                            {dealer.totalVehicles}
                          </p>
                        </div>
                        <div className="p-3 text-center">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-blue-600">
                            In Stock
                          </p>
                          <p className="text-lg font-black text-blue-600 tabular">
                            {dealer.inStock}
                          </p>
                        </div>
                        <div className="p-3 text-center">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-purple-600">
                            Dispatched
                          </p>
                          <p className="text-lg font-black text-purple-600 tabular">
                            {dealer.dispatched}
                          </p>
                        </div>
                        <div className="p-3 text-center">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-600">
                            Sold
                          </p>
                          <p className="text-lg font-black text-emerald-600 tabular">
                            {dealer.sold}
                          </p>
                        </div>
                      </div>

                      {/* Sample vehicles preview */}
                      {dealer.vehicles && dealer.vehicles.length > 0 && (
                        <div className="p-3">
                          <DataTable
                            columns={[
                              {
                                key: "chassisNumber",
                                label: "Chassis No.",
                                className: "font-mono text-xs",
                              },
                              { key: "modelName", label: "Model" },
                              { key: "bodyTypeName", label: "Body" },
                              { key: "colorName", label: "Color" },
                              {
                                key: "_stage",
                                label: "Stage",
                                render: (row) =>
                                  row._stage === "sold" ? (
                                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      Sold
                                    </span>
                                  ) : (
                                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                      In Stock
                                    </span>
                                  ),
                              },
                            ]}
                            rows={dealer.vehicles.slice(0, 3)}
                            rowKey={(row) => row.id ?? row.chassisNumber}
                            emptyText="No vehicles."
                          />
                          {dealer.vehicles.length > 3 && (
                            <p className="text-center text-[10px] text-slate-400 mt-2">
                              +{dealer.vehicles.length - 3} more vehicles
                            </p>
                          )}
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </section>

      {selectedDealer && (
        <DealerVehiclesModal
          dealer={selectedDealer}
          onClose={() => setSelectedDealer(null)}
        />
      )}
    </>
  );
};

export default DisplayVehicleInfo;
