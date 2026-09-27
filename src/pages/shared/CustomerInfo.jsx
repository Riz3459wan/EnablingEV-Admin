import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  Trash2,
  X,
  LayoutGrid,
  List,
  Building2,
  Users,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { ROLE_DASH, ROLE_LABEL } from "../../auth/roleConfig";
import DataTable from "../../components/ui/DataTable";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Pagination from "../../components/ui/Pagination";
import FilterSelect from "../../components/ui/FilterSelect";
import Card from "../../components/ui/Card";
import {
  Banner,
  ErrorCard,
  LoadingCard,
} from "../../components/ui/AsyncStates";
import { useCustomers, useDeleteCustomer } from "../../hooks/useCustomers";
import { useDealers } from "../../hooks/useDealers";
import usePagination from "../../hooks/usePagination";

const CustomerInfo = () => {
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const [stateFilter, setStateFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [dealerFilter, setDealerFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table"); // "table" | "grouped"
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [banner, setBanner] = useState(null);

  const { data, loading, error } = useCustomers();
  const { data: dealersData } = useDealers();
  const deleteCustomer = useDeleteCustomer();

  const list = data ?? [];
  const dealers = dealersData ?? [];

  // Dealer lookup map
  const dealerMap = useMemo(() => {
    const map = {};
    dealers.forEach((d) => {
      map[d.dealerCode] = d.name;
    });
    return map;
  }, [dealers]);

  // ── Dealer options ──
  const dealerOptions = useMemo(() => {
    if (!isAdmin) return [];
    const uniqueCodes = [
      ...new Set(list.map((c) => c.dealerCode).filter(Boolean)),
    ].sort();
    return [
      { value: "all", label: "All Dealers" },
      ...uniqueCodes.map((code) => ({
        value: code,
        label: dealerMap[code] ? `${dealerMap[code]} (${code})` : code,
      })),
    ];
  }, [list, isAdmin, dealerMap]);

  const stateOptions = useMemo(() => {
    const base =
      dealerFilter === "all"
        ? list
        : list.filter((c) => c.dealerCode === dealerFilter);
    const values = [
      ...new Set(base.map((c) => c.state).filter(Boolean)),
    ].sort();
    return [
      { value: "all", label: "All States" },
      ...values.map((v) => ({ value: v, label: v })),
    ];
  }, [list, dealerFilter]);

  const districtOptions = useMemo(() => {
    let base = list;
    if (dealerFilter !== "all")
      base = base.filter((c) => c.dealerCode === dealerFilter);
    if (stateFilter !== "all")
      base = base.filter((c) => c.state === stateFilter);
    const values = [...new Set(base.map((c) => c.dist).filter(Boolean))].sort();
    return [
      { value: "all", label: "All Districts" },
      ...values.map((v) => ({ value: v, label: v })),
    ];
  }, [list, dealerFilter, stateFilter]);

  const filtered = useMemo(() => {
    return list.filter((c) => {
      if (!isAdmin && dealerFilter !== "all" && c.dealerCode !== dealerFilter)
        return false;
      if (isAdmin && dealerFilter !== "all" && c.dealerCode !== dealerFilter)
        return false;
      if (stateFilter !== "all" && c.state !== stateFilter) return false;
      if (districtFilter !== "all" && c.dist !== districtFilter) return false;
      return true;
    });
  }, [list, dealerFilter, stateFilter, districtFilter, isAdmin]);

  // ── Grouped by dealer ──
  const groupedByDealer = useMemo(() => {
    const groups = {};
    filtered.forEach((c) => {
      const key = c.dealerCode || "UNKNOWN";
      if (!groups[key]) {
        groups[key] = {
          dealerCode: key,
          dealerName: dealerMap[key] || "Unknown Dealer",
          customers: [],
        };
      }
      groups[key].customers.push(c);
    });
    return Object.values(groups).sort((a, b) =>
      a.dealerName.localeCompare(b.dealerName),
    );
  }, [filtered, dealerMap]);

  const pagination = usePagination(filtered, 25);

  const hasActiveFilters =
    dealerFilter !== "all" || stateFilter !== "all" || districtFilter !== "all";

  const clearFilters = () => {
    setDealerFilter("all");
    setStateFilter("all");
    setDistrictFilter("all");
    pagination.reset();
  };

  const handleDealerChange = (value) => {
    setDealerFilter(value);
    setStateFilter("all");
    setDistrictFilter("all");
    pagination.reset();
  };

  const handleStateChange = (value) => {
    setStateFilter(value);
    setDistrictFilter("all");
    pagination.reset();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setBanner(null);
    try {
      await deleteCustomer.mutateAsync(deleteTarget.id);
      setBanner({
        type: "success",
        text: `Deleted customer record for chassis ${deleteTarget.chassisNumber}.`,
      });
      setDeleteTarget(null);
    } catch (err) {
      setBanner({
        type: "error",
        text:
          err?.response?.data?.message ||
          "Couldn't delete this customer. Please try again.",
      });
    }
  };

  const columns = useMemo(
    () => [
      ...(isAdmin ? [{ key: "dealerCode", label: "Dealer" }] : []),
      {
        key: "chassisNumber",
        label: "Chassis Number",
        className: "font-mono text-xs",
      },
      { key: "name", label: "Name" },
      { key: "mobileNumber", label: "Mobile" },
      { key: "emailId", label: "Email" },
      { key: "address", label: "Address", wrap: true },
      { key: "pincode", label: "Pincode" },
      { key: "state", label: "State" },
      { key: "dist", label: "District" },
      ...(isAdmin
        ? [
            {
              key: "actions",
              label: "",
              render: (row) => (
                <button
                  onClick={() => setDeleteTarget(row)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                  aria-label={`Delete customer ${row.chassisNumber}`}
                >
                  <Trash2 size={16} />
                </button>
              ),
            },
          ]
        : []),
    ],
    [isAdmin],
  );

  const title = isAdmin ? "Customer Info" : "My Customers";

  return (
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
          {title}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {isAdmin
            ? "Every customer registered against a vehicle, grouped by dealer."
            : "Customers registered against vehicles from your dealership."}
        </p>
      </div>

      {banner && <Banner type={banner.type}>{banner.text}</Banner>}

      {loading ? (
        <LoadingCard />
      ) : error ? (
        <ErrorCard message={error} />
      ) : (
        <>
          {/* Filters + View Toggle */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4 flex-wrap">
            {isAdmin && (
              <FilterSelect
                label="Filter by dealer"
                value={dealerFilter}
                onChange={handleDealerChange}
                options={dealerOptions}
                className="w-full lg:w-64"
              />
            )}
            <FilterSelect
              label="Filter by state"
              value={stateFilter}
              onChange={handleStateChange}
              options={stateOptions}
              className="w-full lg:w-56"
            />
            <FilterSelect
              label="Filter by district"
              value={districtFilter}
              onChange={(v) => {
                setDistrictFilter(v);
                pagination.reset();
              }}
              options={districtOptions}
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

            {/* View toggle */}
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
                Group by Dealer
              </button>
            </div>
          </div>

          {/* Count */}
          <p className="text-xs text-slate-500 mb-4">
            {viewMode === "table"
              ? `Showing ${pagination.total} customer${pagination.total !== 1 ? "s" : ""}`
              : `${groupedByDealer.length} dealer${groupedByDealer.length !== 1 ? "s" : ""} · ${filtered.length} total customers`}
          </p>

          {/* TABLE VIEW */}
          {viewMode === "table" && (
            <>
              <DataTable
                columns={columns}
                rows={pagination.pageItems}
                rowKey={(row) => row.id ?? row.chassisNumber}
                emptyText={
                  hasActiveFilters
                    ? "No customers match your filters."
                    : "No customers registered yet."
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
                    No customers found.
                  </p>
                </Card>
              ) : (
                groupedByDealer.map((group) => (
                  <Card
                    key={group.dealerCode}
                    className="overflow-hidden border-slate-200/80"
                  >
                    {/* Dealer header */}
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
                            {group.dealerCode}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200">
                          <Users size={11} className="text-blue-600" />
                          <span className="text-xs font-black text-blue-700 tabular">
                            {group.customers.length}
                          </span>
                          <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">
                            customers
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Customers table */}
                    <div className="p-3">
                      <DataTable
                        columns={columns.filter((c) => c.key !== "dealerCode")}
                        rows={group.customers}
                        rowKey={(row) => row.id ?? row.chassisNumber}
                        emptyText="No customers for this dealer."
                      />
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete customer record?"
        message={`This permanently removes the customer record for chassis ${deleteTarget?.chassisNumber ?? ""}${deleteTarget?.name ? ` (${deleteTarget.name})` : ""}. This can't be undone.`}
        busy={deleteCustomer.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
};

export default CustomerInfo;
