import { useMemo, useState } from "react";
import { ArrowLeft, Eye, FileText, X } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { useDealerInfo } from "../../auth/useDealerInfo";
import { ROLE_LABEL } from "../../auth/roleConfig";
import DataTable from "../../components/ui/DataTable";
import Modal from "../../components/ui/Modal";
import Card from "../../components/ui/Card";
import Pagination from "../../components/ui/Pagination";
import FilterSelect from "../../components/ui/FilterSelect";
import { ErrorCard, LoadingCard } from "../../components/ui/AsyncStates";
import { statusBadgeClass } from "../../features/quotation/constants";
import { formatINR, gstBreakdown } from "../../features/quotation/calc";
import { useQuotations } from "../../hooks/useQuotations";
import usePagination from "../../hooks/usePagination";

const MIN_DEALER_CODE_LENGTH = 7;

const StatusBadge = ({ status }) => (
  <span
    className={`inline-block px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-full border ${statusBadgeClass(status)}`}
  >
    {status || "Pending"}
  </span>
);

const QuotationDetailModal = ({ quotation, onClose }) => {
  if (!quotation) return null;
  const q = quotation;
  const gst = gstBreakdown(q.totalAmount);

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
      open={!!quotation}
      onClose={onClose}
      title="Quotation Details"
      maxWidth="max-w-2xl"
    >
      <div className="flex items-start justify-between mb-5 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText size={16} className="text-blue-600" />
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Quotation
            </span>
          </div>
          <p className="text-lg font-bold text-slate-800 font-mono">
            {q.chassisNumber || "—"}
          </p>
        </div>
        <StatusBadge status={q.status} />
      </div>

      <h3 className="text-sm font-bold text-slate-800 mb-2">
        Dealer Information
      </h3>
      <div className="grid sm:grid-cols-2 gap-x-6 mb-5">
        <Row label="Dealer Name" value={q.dealerName} />
        <Row label="Dealer Code" value={q.dealerCode} mono />
        <Row label="GSTIN" value={q.dealerGstin} mono />
        <Row label="State" value={q.dealerState} />
        <Row label="District" value={q.dealerDistrict} />
        <Row label="Pin Code" value={q.dealerPinCode} />
        <div className="sm:col-span-2">
          <Row label="Address" value={q.dealerAddress} />
        </div>
      </div>

      <h3 className="text-sm font-bold text-slate-800 mb-2">Vehicle Details</h3>
      <div className="grid sm:grid-cols-2 gap-x-6 mb-5">
        <Row label="Vehicle Type" value={q.vehicleType} />
        <Row label="Brand Prefix" value={q.brandPrefix} />
        <Row label="Model" value={q.modelName} />
        <Row label="Body Type" value={q.bodyTypeName} />
        <Row label="Color" value={q.colorName} />
        <Row label="Bill Number" value={q.billNumber} mono />
      </div>

      <h3 className="text-sm font-bold text-slate-800 mb-2">Battery</h3>
      <div className="grid sm:grid-cols-2 gap-x-6 mb-5">
        <Row label="Battery Type" value={q.batteryType} />
        <Row
          label="Specs"
          value={[
            q.batteryVolt && `${q.batteryVolt}V`,
            q.batteryAmpereHours && `${q.batteryAmpereHours}Ah`,
          ]
            .filter(Boolean)
            .join(" / ")}
        />
      </div>

      <h3 className="text-sm font-bold text-slate-800 mb-2">Price Breakdown</h3>
      <div className="bg-slate-50 rounded-lg p-4">
        <Row label="Model Price" value={formatINR(q.modelPrice)} />
        <Row label="Body Type Price" value={formatINR(q.bodyTypePrice)} />
        <Row label="Battery Price" value={formatINR(q.batteryPrice)} />
        <div className="my-2 border-t border-slate-200" />
        <Row label="Subtotal (excl. GST)" value={formatINR(gst.subtotal)} />
        <Row label="CGST (2.5%)" value={formatINR(gst.cgst)} />
        <Row label="SGST (2.5%)" value={formatINR(gst.sgst)} />
        <div className="my-2 border-t-2 border-slate-300" />
        <div className="flex justify-between py-2">
          <span className="text-sm font-bold text-slate-800">Total Amount</span>
          <span className="text-lg font-bold text-blue-600">
            {formatINR(q.totalAmount)}
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

const Quotations = () => {
  const { role } = useAuth();
  const { dealerCode } = useDealerInfo();
  const isDealer = role === "dealer";
  const canLoad = !isDealer || dealerCode.length >= MIN_DEALER_CODE_LENGTH;

  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dealerFilter, setDealerFilter] = useState("all");
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  const { data, loading, error } = useQuotations(
    canLoad && isDealer ? { dealerCode } : undefined,
  );
  const list = data ?? [];

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "Dispatched", label: "Dispatched" },
    { value: "Under Billing", label: "Under Billing" },
    { value: "Under Assembling", label: "Under Assembling" },
  ];

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "rikshaw", label: "Rikshaw" },
    { value: "cargo", label: "Cargo / Loader" },
  ];

  const dealerOptions = useMemo(() => {
    if (isDealer) return [];
    const map = new Map();
    list.forEach((q) => {
      if (q.dealerCode && !map.has(q.dealerCode)) {
        map.set(q.dealerCode, `${q.dealerName || "Unknown"} (${q.dealerCode})`);
      }
    });
    return [
      { value: "all", label: "All Dealers" },
      ...[...map.entries()]
        .map(([value, label]) => ({ value, label }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    ];
  }, [list, isDealer]);

  const filtered = useMemo(() => {
    return list.filter((q) => {
      if (statusFilter !== "all" && q.status !== statusFilter) return false;

      if (typeFilter !== "all") {
        const vType = String(q.vehicleType || "").toLowerCase();
        if (
          typeFilter === "rikshaw" &&
          !vType.includes("rikshaw") &&
          !vType.includes("rickshaw")
        )
          return false;
        if (
          typeFilter === "cargo" &&
          !vType.includes("cargo") &&
          !vType.includes("loader")
        )
          return false;
      }

      if (!isDealer && dealerFilter !== "all" && q.dealerCode !== dealerFilter)
        return false;

      return true;
    });
  }, [list, statusFilter, typeFilter, dealerFilter, isDealer]);

  const pagination = usePagination(filtered, 25);

  const hasActiveFilters =
    statusFilter !== "all" ||
    typeFilter !== "all" ||
    (!isDealer && dealerFilter !== "all");

  const clearFilters = () => {
    setStatusFilter("all");
    setTypeFilter("all");
    setDealerFilter("all");
    pagination.reset();
  };

  const stats = useMemo(() => {
    const total = list.length;
    const dispatched = list.filter((q) => q.status === "Dispatched").length;
    const billing = list.filter((q) => q.status === "Under Billing").length;
    const totalValue = list.reduce(
      (sum, q) => sum + (Number(q.totalAmount) || 0),
      0,
    );
    return { total, dispatched, billing, totalValue };
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
                  <p className="font-medium text-slate-800">
                    {row.dealerName || "—"}
                  </p>
                  {row.dealerCode && (
                    <p className="text-[11px] text-slate-500 font-mono">
                      {row.dealerCode}
                    </p>
                  )}
                </div>
              ),
            },
          ]),
      { key: "modelName", label: "Model" },
      { key: "bodyTypeName", label: "Body Type" },
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
        key: "status",
        label: "Status",
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "actions",
        label: "",
        render: (row) => (
          <button
            onClick={() => setSelectedQuotation(row)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            aria-label="View details"
          >
            <Eye size={16} />
          </button>
        ),
      },
    ],
    [isDealer],
  );

  if (!canLoad) {
    return (
      <section className="w-full">
        <ErrorCard message="Dealer code not found for this session. Please log out and sign in again." />
      </section>
    );
  }

  return (
    <section className="w-full">
      <div className="mb-6">
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          {ROLE_LABEL[role]} · Operations
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          {isDealer ? "My Quotations" : "All Quotations"}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {isDealer
            ? "Quotations created for your dealership."
            : "Every quotation generated across all dealers."}
        </p>
      </div>

      {loading ? (
        <LoadingCard />
      ) : error ? (
        <ErrorCard message={error} />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Card className="p-4">
              <p className="text-xs text-slate-500 mb-1">Total Quotations</p>
              <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-slate-500 mb-1">Dispatched</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.dispatched}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-slate-500 mb-1">Under Billing</p>
              <p className="text-2xl font-bold text-sky-600">{stats.billing}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-slate-500 mb-1">Total Value</p>
              <p className="text-2xl font-bold text-slate-800">
                {formatINR(stats.totalValue)}
              </p>
            </Card>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
            <FilterSelect
              label="Filter by status"
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v);
                pagination.reset();
              }}
              options={statusOptions}
              className="w-full lg:w-52"
            />
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

            {!isDealer && dealerOptions.length > 0 && (
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
              {pagination.total === 1 ? "quotation" : "quotations"}
            </p>
          </div>

          <DataTable
            columns={columns}
            rows={pagination.pageItems}
            rowKey={(row) => row.id ?? row.chassisNumber}
            emptyText={
              hasActiveFilters
                ? "No quotations match your filters."
                : "No quotations found yet."
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

      <QuotationDetailModal
        quotation={selectedQuotation}
        onClose={() => setSelectedQuotation(null)}
      />
    </section>
  );
};

export default Quotations;
