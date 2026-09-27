import { useEffect, useMemo, useState } from "react";
import { Search, X, Eye } from "lucide-react";
import Modal from "../ui/Modal";
import DataTable from "../ui/DataTable";
import Pagination from "../ui/Pagination";
import FilterSelect from "../ui/FilterSelect";
import { Input } from "../ui/Field";
import { ErrorCard, LoadingCard } from "../ui/AsyncStates";
import { useInventoryBreakdown } from "../../hooks/useInventory";
import usePagination from "../../hooks/usePagination";
import VehicleDetailsModal from "./VehicleDetailsModal";

const applyFilters = (list, filters, exclude) => {
  return list.filter((v) => {
    if (
      exclude !== "model" &&
      filters.model !== "all" &&
      v.modelName !== filters.model
    )
      return false;
    if (
      exclude !== "bodyType" &&
      filters.bodyType !== "all" &&
      v.bodyTypeName !== filters.bodyType
    )
      return false;
    if (
      exclude !== "color" &&
      filters.color !== "all" &&
      v.colorName !== filters.color
    )
      return false;
    if (exclude !== "battery" && filters.battery !== "all") {
      const batt = `${v.batteryVolt}V/${v.batteryAmpereHours}Ah`;
      if (batt !== filters.battery) return false;
    }
    return true;
  });
};

const VehiclesListModal = ({ filter, onClose }) => {
  const [search, setSearch] = useState("");
  const [modelFilter, setModelFilter] = useState("all");
  const [bodyTypeFilter, setBodyTypeFilter] = useState("all");
  const [colorFilter, setColorFilter] = useState("all");
  const [batteryFilter, setBatteryFilter] = useState("all");
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const open = !!filter;

  // Reset on open
  useEffect(() => {
    if (open) {
      setSearch("");
      setModelFilter("all");
      setBodyTypeFilter("all");
      setColorFilter("all");
      setBatteryFilter("all");
      setSelectedVehicle(null);
    }
  }, [open, filter?.vehicleTypeKey, filter?.assemblyStatus]);

  const { data, loading, error } = useInventoryBreakdown(
    open && filter
      ? {
          vehicleType: filter.vehicleTypeKey || "rikshaw",
          assemblyStatus: filter.assemblyStatus || "",
        }
      : null,
  );

  const list = data ?? [];

  const currentFilters = {
    model: modelFilter,
    bodyType: bodyTypeFilter,
    color: colorFilter,
    battery: batteryFilter,
  };

  // Cascading options
  const modelOptions = useMemo(() => {
    const base = applyFilters(list, currentFilters, "model");
    const values = [
      ...new Set(base.map((v) => v.modelName).filter(Boolean)),
    ].sort();
    return [
      { value: "all", label: "All Models" },
      ...values.map((v) => ({ value: v, label: v })),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, bodyTypeFilter, colorFilter, batteryFilter]);

  const bodyTypeOptions = useMemo(() => {
    const base = applyFilters(list, currentFilters, "bodyType");
    const values = [
      ...new Set(base.map((v) => v.bodyTypeName).filter(Boolean)),
    ].sort();
    return [
      { value: "all", label: "All Body Types" },
      ...values.map((v) => ({ value: v, label: v })),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, modelFilter, colorFilter, batteryFilter]);

  const colorOptions = useMemo(() => {
    const base = applyFilters(list, currentFilters, "color");
    const values = [
      ...new Set(base.map((v) => v.colorName).filter(Boolean)),
    ].sort();
    return [
      { value: "all", label: "All Colors" },
      ...values.map((v) => ({ value: v, label: v })),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, modelFilter, bodyTypeFilter, batteryFilter]);

  const batteryOptions = useMemo(() => {
    const base = applyFilters(list, currentFilters, "battery");
    const values = [
      ...new Set(
        base
          .map((v) =>
            v.batteryVolt && v.batteryAmpereHours
              ? `${v.batteryVolt}V/${v.batteryAmpereHours}Ah`
              : null,
          )
          .filter(Boolean),
      ),
    ].sort();
    return [
      { value: "all", label: "All Batteries" },
      ...values.map((v) => ({ value: v, label: v })),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, modelFilter, bodyTypeFilter, colorFilter]);

  // Auto-reset invalid
  useEffect(() => {
    if (
      bodyTypeFilter !== "all" &&
      !bodyTypeOptions.some((o) => o.value === bodyTypeFilter)
    ) {
      setBodyTypeFilter("all");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelFilter, colorFilter, batteryFilter]);

  useEffect(() => {
    if (
      colorFilter !== "all" &&
      !colorOptions.some((o) => o.value === colorFilter)
    ) {
      setColorFilter("all");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelFilter, bodyTypeFilter, batteryFilter]);

  useEffect(() => {
    if (
      batteryFilter !== "all" &&
      !batteryOptions.some((o) => o.value === batteryFilter)
    ) {
      setBatteryFilter("all");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelFilter, bodyTypeFilter, colorFilter]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return applyFilters(list, currentFilters, null).filter((v) => {
      if (!term) return true;
      return [
        v.chassisNumber,
        v.modelName,
        v.bodyTypeName,
        v.colorName,
        v.dealerName,
      ].some((f) => f?.toString().toLowerCase().includes(term));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, modelFilter, bodyTypeFilter, colorFilter, batteryFilter, search]);

  const pagination = usePagination(filtered, 25);

  const hasActiveFilters =
    modelFilter !== "all" ||
    bodyTypeFilter !== "all" ||
    colorFilter !== "all" ||
    batteryFilter !== "all" ||
    search.trim().length > 0;

  const clearFilters = () => {
    setSearch("");
    setModelFilter("all");
    setBodyTypeFilter("all");
    setColorFilter("all");
    setBatteryFilter("all");
    pagination.reset();
  };

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
        key: "battery",
        label: "Battery",
        render: (row) => (
          <span className="text-xs text-slate-600">
            {row.batteryVolt}V / {row.batteryAmpereHours}Ah
          </span>
        ),
      },
      {
        key: "dealerName",
        label: "Dealer",
        render: (row) =>
          row.dealerName && row.dealerName !== "—" ? (
            <div>
              <p className="font-medium text-slate-800 text-xs">
                {row.dealerName}
              </p>
              {row.dealerCode && row.dealerCode !== "—" && (
                <p className="text-[10px] text-slate-500 font-mono">
                  {row.dealerCode}
                </p>
              )}
            </div>
          ) : (
            <span className="text-slate-400 text-xs italic">Factory stock</span>
          ),
      },
      {
        key: "assemblyStatus",
        label: "Status",
        render: (row) => (
          <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {row.assemblyStatus}
          </span>
        ),
      },
      {
        key: "actions",
        label: "",
        render: (row) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedVehicle(row);
            }}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
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
        title={filter.title || "Vehicles"}
        subtitle={`${filtered.length} vehicles`}
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
                label="Model"
                value={modelFilter}
                onChange={(v) => {
                  setModelFilter(v);
                  pagination.reset();
                }}
                options={modelOptions}
                className="w-full lg:w-40"
              />

              <FilterSelect
                label="Body type"
                value={bodyTypeFilter}
                onChange={(v) => {
                  setBodyTypeFilter(v);
                  pagination.reset();
                }}
                options={bodyTypeOptions}
                className="w-full lg:w-44"
              />

              <FilterSelect
                label="Color"
                value={colorFilter}
                onChange={(v) => {
                  setColorFilter(v);
                  pagination.reset();
                }}
                options={colorOptions}
                className="w-full lg:w-40"
              />

              <FilterSelect
                label="Battery"
                value={batteryFilter}
                onChange={(v) => {
                  setBatteryFilter(v);
                  pagination.reset();
                }}
                options={batteryOptions}
                className="w-full lg:w-48"
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
            </div>

            <DataTable
              columns={columns}
              rows={pagination.pageItems}
              rowKey={(row) => row.id ?? row.chassisNumber}
              emptyText={
                hasActiveFilters
                  ? "No vehicles match your filters."
                  : "No vehicles found."
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

      {/* ✅ Modal 3: Vehicle Details */}
      <VehicleDetailsModal
        vehicle={selectedVehicle}
        onClose={() => setSelectedVehicle(null)}
      />
    </>
  );
};

export default VehiclesListModal;
