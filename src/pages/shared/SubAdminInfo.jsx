import { useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Trash2, Eye, EyeOff, X } from "lucide-react";
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
import { useSubAdmins, useDeleteSubAdmin } from "../../hooks/useSubAdmins";
import usePagination from "../../hooks/usePagination";

const PasswordCell = ({ value }) => {
  const [visible, setVisible] = useState(false);
  if (!value) return "—";
  return (
    <span className="inline-flex items-center gap-2 font-mono text-xs">
      {visible ? value : "•".repeat(Math.min(value.length, 10))}
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="text-slate-400 hover:text-slate-700 transition-colors"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </span>
  );
};

const SubAdminInfo = () => {
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const [stateFilter, setStateFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [banner, setBanner] = useState(null);

  const { data, loading, error } = useSubAdmins();
  const deleteSubAdmin = useDeleteSubAdmin();

  const list = data ?? [];

  // Unique values for filter options
  const stateOptions = useMemo(() => {
    const values = [
      ...new Set(list.map((s) => s.state).filter(Boolean)),
    ].sort();
    return [
      { value: "all", label: "All States" },
      ...values.map((v) => ({ value: v, label: v })),
    ];
  }, [list]);

  const cityOptions = useMemo(() => {
    const base =
      stateFilter === "all"
        ? list
        : list.filter((s) => s.state === stateFilter);
    const values = [...new Set(base.map((s) => s.city).filter(Boolean))].sort();
    return [
      { value: "all", label: "All Cities" },
      ...values.map((v) => ({ value: v, label: v })),
    ];
  }, [list, stateFilter]);

  const districtOptions = useMemo(() => {
    let base = list;
    if (stateFilter !== "all")
      base = base.filter((s) => s.state === stateFilter);
    if (cityFilter !== "all") base = base.filter((s) => s.city === cityFilter);
    const values = [
      ...new Set(base.map((s) => s.district).filter(Boolean)),
    ].sort();
    return [
      { value: "all", label: "All Districts" },
      ...values.map((v) => ({ value: v, label: v })),
    ];
  }, [list, stateFilter, cityFilter]);

  const filtered = useMemo(() => {
    return list.filter((s) => {
      if (stateFilter !== "all" && s.state !== stateFilter) return false;
      if (cityFilter !== "all" && s.city !== cityFilter) return false;
      if (districtFilter !== "all" && s.district !== districtFilter)
        return false;
      return true;
    });
  }, [list, stateFilter, cityFilter, districtFilter]);

  const pagination = usePagination(filtered, 25);

  const hasActiveFilters =
    stateFilter !== "all" || cityFilter !== "all" || districtFilter !== "all";

  const clearFilters = () => {
    setStateFilter("all");
    setCityFilter("all");
    setDistrictFilter("all");
    pagination.reset();
  };

  const handleStateChange = (value) => {
    setStateFilter(value);
    setCityFilter("all");
    setDistrictFilter("all");
    pagination.reset();
  };

  const handleCityChange = (value) => {
    setCityFilter(value);
    setDistrictFilter("all");
    pagination.reset();
  };

  const handleDistrictChange = (value) => {
    setDistrictFilter(value);
    pagination.reset();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setBanner(null);
    try {
      await deleteSubAdmin.mutateAsync(deleteTarget.id);
      setBanner({
        type: "success",
        text: `Deleted sub-admin profile for ${deleteTarget.fullName || deleteTarget.userId}.`,
      });
      setDeleteTarget(null);
    } catch (err) {
      setBanner({
        type: "error",
        text:
          err?.response?.data?.message ||
          "Couldn't delete this sub-admin. Please try again.",
      });
    }
  };

  const columns = useMemo(
    () => [
      { key: "fullName", label: "Full Name" },
      { key: "mobileNumber", label: "Mobile" },
      { key: "email", label: "Email" },
      { key: "address", label: "Address", wrap: true },
      { key: "city", label: "City" },
      { key: "district", label: "District" },
      { key: "pincode", label: "Pincode" },
      { key: "state", label: "State" },
      { key: "userId", label: "User ID", className: "font-mono text-xs" },
      {
        key: "password",
        label: "Password",
        render: (row) => <PasswordCell value={row.password} />,
      },
      ...(isAdmin
        ? [
            {
              key: "actions",
              label: "",
              render: (row) => (
                <button
                  onClick={() => setDeleteTarget(row)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                  aria-label={`Delete sub-admin ${row.fullName || row.userId}`}
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
          Sub Admin Info
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          All sub-admin accounts on the platform.
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
              label="Filter by city"
              value={cityFilter}
              onChange={handleCityChange}
              options={cityOptions}
              className="w-full lg:w-56"
            />
            <FilterSelect
              label="Filter by district"
              value={districtFilter}
              onChange={handleDistrictChange}
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

            <p className="text-xs text-slate-500 lg:ml-auto">
              Showing {pagination.total}{" "}
              {pagination.total === 1 ? "record" : "records"}
            </p>
          </div>

          <DataTable
            columns={columns}
            rows={pagination.pageItems}
            rowKey={(row) => row.id ?? row.userId}
            emptyText={
              hasActiveFilters
                ? "No sub-admins match your filters."
                : "No sub-admins created yet."
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
          title="Delete sub-admin profile?"
          message={`This permanently removes the sub-admin profile for ${deleteTarget?.fullName || deleteTarget?.userId || ""}. This can't be undone.`}
          busy={deleteSubAdmin.isPending}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </section>
  );
};

export default SubAdminInfo;
