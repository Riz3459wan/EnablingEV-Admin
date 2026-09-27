import { useEffect, useMemo, useState } from "react";
import { Search, X, Eye } from "lucide-react";
import Modal from "../ui/Modal";
import DataTable from "../ui/DataTable";
import Pagination from "../ui/Pagination";
import FilterSelect from "../ui/FilterSelect";
import { Input } from "../ui/Field";
import { ErrorCard, LoadingCard } from "../ui/AsyncStates";
import { useDealers } from "../../hooks/useDealers";
import usePagination from "../../hooks/usePagination";
import DealerDetailsModal from "./DealerDetailsModal";

const applyFilters = (list, filters, exclude) => {
  return list.filter((d) => {
    if (
      exclude !== "state" &&
      filters.state !== "all" &&
      d.state !== filters.state
    )
      return false;
    if (
      exclude !== "district" &&
      filters.district !== "all" &&
      d.dist !== filters.district
    )
      return false;
    return true;
  });
};

const DealersListModal = ({ filter, onClose }) => {
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [selectedDealer, setSelectedDealer] = useState(null);

  const open = !!filter;

  useEffect(() => {
    if (open) {
      setSearch("");
      setStateFilter(filter?.state || "all");
      setDistrictFilter("all");
      setSelectedDealer(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, filter?.status, filter?.state]);

  const { data, loading, error } = useDealers();
  const list = data ?? [];

  const statusFiltered = useMemo(() => {
    if (!filter?.status) return list;
    if (filter.status === "active") {
      return list.filter((d) => !!d.activationCode);
    }
    if (filter.status === "pending") {
      return list.filter((d) => !d.activationCode);
    }
    if (filter.status === "suspended") {
      return [];
    }
    return list;
  }, [list, filter?.status]);

  const currentFilters = {
    state: stateFilter,
    district: districtFilter,
  };

  const stateOptions = useMemo(() => {
    const base = applyFilters(statusFiltered, currentFilters, "state");
    const values = [
      ...new Set(base.map((d) => d.state).filter(Boolean)),
    ].sort();
    return [
      { value: "all", label: "All States" },
      ...values.map((v) => ({ value: v, label: v })),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFiltered, districtFilter]);

  const districtOptions = useMemo(() => {
    const base = applyFilters(statusFiltered, currentFilters, "district");
    const values = [...new Set(base.map((d) => d.dist).filter(Boolean))].sort();
    return [
      { value: "all", label: "All Districts" },
      ...values.map((v) => ({ value: v, label: v })),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFiltered, stateFilter]);

  useEffect(() => {
    if (
      districtFilter !== "all" &&
      !districtOptions.some((o) => o.value === districtFilter)
    ) {
      setDistrictFilter("all");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateFilter]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return applyFilters(statusFiltered, currentFilters, null).filter((d) => {
      if (!term) return true;
      return [
        d.name,
        d.dealerCode,
        d.emailId,
        d.mobileNo,
        d.gstin,
        d.state,
        d.dist,
      ].some((f) => f?.toString().toLowerCase().includes(term));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFiltered, stateFilter, districtFilter, search]);

  const pagination = usePagination(filtered, 25);

  const hasActiveFilters =
    stateFilter !== "all" ||
    districtFilter !== "all" ||
    search.trim().length > 0;

  const clearFilters = () => {
    setSearch("");
    setStateFilter("all");
    setDistrictFilter("all");
    pagination.reset();
  };

  const columns = useMemo(
    () => [
      {
        key: "dealerCode",
        label: "Code",
        className: "font-mono text-xs",
      },
      {
        key: "name",
        label: "Dealer",
        render: (row) => (
          <div>
            <p className="font-bold text-slate-800 text-xs">{row.name}</p>
            {row.emailId && (
              <p className="text-[10px] text-slate-500">{row.emailId}</p>
            )}
          </div>
        ),
      },
      { key: "mobileNo", label: "Mobile" },
      { key: "state", label: "State" },
      { key: "dist", label: "District" },
      {
        key: "activationCode",
        label: "Status",
        render: (row) =>
          row.activationCode ? (
            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active
            </span>
          ) : (
            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              Pending
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
              setSelectedDealer(row);
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
        title={filter.title || "Dealers"}
        subtitle={`${filtered.length} dealers`}
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
                  placeholder="Search name, code, GSTIN..."
                  className="!pl-10"
                />
              </div>

              <FilterSelect
                label="State"
                value={stateFilter}
                onChange={(v) => {
                  setStateFilter(v);
                  pagination.reset();
                }}
                options={stateOptions}
                className="w-full lg:w-44"
              />

              <FilterSelect
                label="District"
                value={districtFilter}
                onChange={(v) => {
                  setDistrictFilter(v);
                  pagination.reset();
                }}
                options={districtOptions}
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
              rowKey={(row) => row.id ?? row.dealerCode}
              emptyText={
                hasActiveFilters
                  ? "No dealers match your filters."
                  : "No dealers found."
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

      <DealerDetailsModal
        dealer={selectedDealer}
        onClose={() => setSelectedDealer(null)}
      />
    </>
  );
};

export default DealersListModal;
