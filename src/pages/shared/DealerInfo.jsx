import { useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Trash2, X } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { ROLE_DASH, ROLE_LABEL } from "../../auth/roleConfig";
import DataTable from "../../components/ui/DataTable";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Pagination from "../../components/ui/Pagination";
import FilterSelect from "../../components/ui/FilterSelect";
import {
  Banner,
  ErrorCard,
  LoadingCard,
} from "../../components/ui/AsyncStates";
import { useDealers, useDeleteDealer } from "../../hooks/useDealers";
import usePagination from "../../hooks/usePagination";

const DealerInfo = () => {
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const [stateFilter, setStateFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [rtoFilter, setRtoFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [banner, setBanner] = useState(null);

  const { data, loading, error } = useDealers();
  const deleteDealer = useDeleteDealer();

  const list = data ?? [];

  const stateOptions = useMemo(() => {
    const values = [
      ...new Set(list.map((d) => d.state).filter(Boolean)),
    ].sort();
    return [
      { value: "all", label: "All States" },
      ...values.map((v) => ({ value: v, label: v })),
    ];
  }, [list]);

  const districtOptions = useMemo(() => {
    const base =
      stateFilter === "all"
        ? list
        : list.filter((d) => d.state === stateFilter);
    const values = [...new Set(base.map((d) => d.dist).filter(Boolean))].sort();
    return [
      { value: "all", label: "All Districts" },
      ...values.map((v) => ({ value: v, label: v })),
    ];
  }, [list, stateFilter]);

  const rtoOptions = useMemo(() => {
    let base = list;
    if (stateFilter !== "all")
      base = base.filter((d) => d.state === stateFilter);
    if (districtFilter !== "all")
      base = base.filter((d) => d.dist === districtFilter);
    const values = [
      ...new Set(base.map((d) => d.rtoOffice).filter(Boolean)),
    ].sort();
    return [
      { value: "all", label: "All RTO Offices" },
      ...values.map((v) => ({ value: v, label: v })),
    ];
  }, [list, stateFilter, districtFilter]);

  const filtered = useMemo(() => {
    return list.filter((d) => {
      if (stateFilter !== "all" && d.state !== stateFilter) return false;
      if (districtFilter !== "all" && d.dist !== districtFilter) return false;
      if (rtoFilter !== "all" && d.rtoOffice !== rtoFilter) return false;
      return true;
    });
  }, [list, stateFilter, districtFilter, rtoFilter]);

  const pagination = usePagination(filtered, 25);

  const hasActiveFilters =
    stateFilter !== "all" || districtFilter !== "all" || rtoFilter !== "all";

  const clearFilters = () => {
    setStateFilter("all");
    setDistrictFilter("all");
    setRtoFilter("all");
    pagination.reset();
  };

  const handleStateChange = (value) => {
    setStateFilter(value);
    setDistrictFilter("all");
    setRtoFilter("all");
    pagination.reset();
  };

  const handleDistrictChange = (value) => {
    setDistrictFilter(value);
    setRtoFilter("all");
    pagination.reset();
  };

  const handleRtoChange = (value) => {
    setRtoFilter(value);
    pagination.reset();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setBanner(null);
    try {
      await deleteDealer.mutateAsync(deleteTarget.id);
      setBanner({
        type: "success",
        text: `Deleted dealer record for ${deleteTarget.name || deleteTarget.dealerCode}.`,
      });
      setDeleteTarget(null);
    } catch (err) {
      setBanner({
        type: "error",
        text:
          err?.response?.data?.message ||
          "Couldn't delete this dealer. Please try again.",
      });
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "dealerCode",
        label: "Dealer Code",
        className: "font-mono text-xs",
      },
      {
        key: "name",
        label: "Name",
        render: (row) => (
          <Link
            to={`/dealerDetails/${row.id || row.dealerCode}`}
            className="font-medium text-blue-600 hover:underline"
          >
            {row.name || "—"}
          </Link>
        ),
      },
      { key: "mobileNo", label: "Mobile" },
      { key: "emailId", label: "Email" },
      { key: "gstin", label: "GSTIN", className: "font-mono text-xs" },
      { key: "address", label: "Address", wrap: true },
      { key: "state", label: "State" },
      { key: "dist", label: "District" },
      { key: "pinCode", label: "Pincode" },
      { key: "rtoOffice", label: "RTO Office" },
      {
        key: "activationCode",
        label: "Activation Code",
        className: "font-mono text-xs",
      },
      { key: "LOIreferenceId", label: "LOI Ref" },
      { key: "RQreferenceId", label: "RQ Ref" },
      ...(isAdmin
        ? [
            {
              key: "actions",
              label: "",
              render: (row) => (
                <button
                  onClick={() => setDeleteTarget(row)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                  aria-label={`Delete dealer ${row.name || row.dealerCode}`}
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
          Dealer Info
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          All registered dealers across the network. Click a dealer name to view
          full details.
        </p>
      </div>

      {banner && <Banner type={banner.type}>{banner.text}</Banner>}

      {loading ? (
        <LoadingCard />
      ) : error ? (
        <ErrorCard message={error} />
      ) : (
        <>
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
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
              onChange={handleDistrictChange}
              options={districtOptions}
              className="w-full lg:w-56"
            />
            <FilterSelect
              label="Filter by RTO office"
              value={rtoFilter}
              onChange={handleRtoChange}
              options={rtoOptions}
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

            <p className="text-xs text-slate-500 lg:ml-auto">
              Showing {pagination.total}{" "}
              {pagination.total === 1 ? "dealer" : "dealers"}
            </p>
          </div>

          <DataTable
            columns={columns}
            rows={pagination.pageItems}
            rowKey={(row) => row.id ?? row.dealerCode}
            emptyText={
              hasActiveFilters
                ? "No dealers match your filters."
                : "No dealers registered yet."
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

      {isAdmin && (
        <ConfirmModal
          open={!!deleteTarget}
          title="Delete dealer record?"
          message={`This permanently removes the dealer record for ${deleteTarget?.name || deleteTarget?.dealerCode || ""}. This can't be undone.`}
          busy={deleteDealer.isPending}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </section>
  );
};

export default DealerInfo;
