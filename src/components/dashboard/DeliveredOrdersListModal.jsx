import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Search, X, Eye, ArrowUpRight } from "lucide-react";
import Modal from "../ui/Modal";
import DataTable from "../ui/DataTable";
import Pagination from "../ui/Pagination";
import FilterSelect from "../ui/FilterSelect";
import { Input } from "../ui/Field";
import { ErrorCard, LoadingCard } from "../ui/AsyncStates";
import { useOrders } from "../../hooks/useOrders";
import usePagination from "../../hooks/usePagination";
import { formatINR } from "../../features/quotation/calc";
import SalesOrderDetailsModal from "./SalesOrderDetailsModal";

const applyFilters = (list, filters, exclude) => {
  return list.filter((o) => {
    if (exclude !== "type" && filters.type !== "all") {
      const v = String(o.vehicleType || "").toLowerCase();
      if (filters.type === "rikshaw" && !v.includes("rikshaw")) return false;
      if (
        filters.type === "cargo" &&
        !v.includes("cargo") &&
        !v.includes("loader")
      )
        return false;
    }
    if (
      exclude !== "model" &&
      filters.model !== "all" &&
      o.modelName !== filters.model
    )
      return false;
    return true;
  });
};

const DeliveredOrdersListModal = ({ filter, onClose }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [modelFilter, setModelFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const open = !!filter;

  useEffect(() => {
    if (open) {
      setSearch("");
      setTypeFilter(filter?.initialType || "all");
      setModelFilter("all");
      setSelectedOrder(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, filter?.initialType]);

  const { data, loading, error } = useOrders();
  const list = data ?? [];

  // ✅ Only delivered orders
  const deliveredList = useMemo(
    () => list.filter((o) => o.status === "Delivered"),
    [list],
  );

  const currentFilters = { type: typeFilter, model: modelFilter };

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "rikshaw", label: "Rikshaw" },
    { value: "cargo", label: "Cargo / Loader" },
  ];

  const modelOptions = useMemo(() => {
    const base = applyFilters(deliveredList, currentFilters, "model");
    const values = [
      ...new Set(base.map((o) => o.modelName).filter(Boolean)),
    ].sort();
    return [
      { value: "all", label: "All Models" },
      ...values.map((v) => ({ value: v, label: v })),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveredList, typeFilter]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return applyFilters(deliveredList, currentFilters, null).filter((o) => {
      if (!term) return true;
      return [
        o.chassisNumber,
        o.orderNumber,
        o.dealerName,
        o.modelName,
        o.colorName,
      ].some((f) => f?.toString().toLowerCase().includes(term));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveredList, typeFilter, modelFilter, search]);

  const pagination = usePagination(filtered, 25);

  const hasActiveFilters =
    typeFilter !== "all" || modelFilter !== "all" || search.trim().length > 0;

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setModelFilter("all");
    pagination.reset();
  };

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
      {
        key: "dealerName",
        label: "Dealer",
        render: (row) => (
          <div>
            <p className="font-medium text-slate-800 text-xs">
              {row.dealerName}
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              {row.dealerCode}
            </p>
          </div>
        ),
      },
      { key: "modelName", label: "Model" },
      { key: "colorName", label: "Color" },
      {
        key: "totalAmount",
        label: "Amount",
        render: (row) => (
          <span className="font-semibold text-slate-800 tabular">
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
            onClick={(e) => {
              e.stopPropagation();
              setSelectedOrder(row);
            }}
            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
            aria-label="View details"
          >
            <Eye size={16} />
          </button>
        ),
      },
    ],
    [],
  );

  if (!filter) return null;

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={filter.title || "Delivered Orders"}
        subtitle={`${filtered.length} delivered order${filtered.length !== 1 ? "s" : ""}`}
        maxWidth="max-w-5xl"
      >
        {loading ? (
          <LoadingCard rows={6} />
        ) : error ? (
          <ErrorCard message={error} />
        ) : (
          <>
            <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4 flex-wrap">
              <div className="relative w-full lg:max-w-xs">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    pagination.reset();
                  }}
                  placeholder="Search chassis, dealer..."
                  className="!pl-10"
                />
              </div>

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

              <FilterSelect
                label="Model"
                value={modelFilter}
                onChange={(v) => {
                  setModelFilter(v);
                  pagination.reset();
                }}
                options={modelOptions}
                className="w-full lg:w-40"
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

              <button
                onClick={() => {
                  const params = new URLSearchParams();
                  params.set("status", "Delivered");
                  if (typeFilter !== "all") params.set("type", typeFilter);
                  navigate(`/orders?${params.toString()}`);
                }}
                className="group inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-white px-3.5 py-2 rounded-lg border border-slate-200 hover:border-slate-900 hover:bg-slate-900 transition-all lg:ml-auto"
              >
                View All
                <ArrowUpRight
                  size={13}
                  className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                />
              </button>
            </div>

            <DataTable
              columns={columns}
              rows={pagination.pageItems}
              rowKey={(row) => row.id ?? row.orderNumber}
              emptyText={
                hasActiveFilters
                  ? "No delivered orders match your filters."
                  : "No delivered orders yet."
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
      </Modal>

      <SalesOrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </>
  );
};

export default DeliveredOrdersListModal;
