import { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import {
  ArrowLeft,
  Eye,
  FileText,
  CheckCircle2,
  Truck,
  Package,
  ShieldCheck,
  XCircle,
  Home,
  HardHat,
  X,
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { ROLE_DASH, ROLE_LABEL } from "../../auth/roleConfig";
import DataTable from "../../components/ui/DataTable";
import Modal from "../../components/ui/Modal";
import Card from "../../components/ui/Card";
import Pagination from "../../components/ui/Pagination";
import FilterSelect from "../../components/ui/FilterSelect";
import {
  Banner,
  ErrorCard,
  LoadingCard,
} from "../../components/ui/AsyncStates";
import { PrimaryButton, SecondaryButton } from "../../components/ui/Button";
import { formatINR, gstBreakdown } from "../../features/quotation/calc";
import {
  useOrders,
  useApproveOrder,
  useRejectOrder,
} from "../../hooks/useOrders";
import usePagination from "../../hooks/usePagination";

const ORDER_STATUS = {
  PENDING_APPROVAL: "Pending Approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  BILLING_IN_PROGRESS: "Billing in Progress",
  BILLED: "Billed",
  READY_TO_DISPATCH: "Ready to Dispatch",
  DISPATCHED: "Dispatched",
  DELIVERED: "Delivered",
};

const STATUS_STYLES = {
  "Pending Approval": "bg-amber-50 text-amber-700 border-amber-200",
  Approved: "bg-blue-50 text-blue-700 border-blue-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
  "Billing in Progress": "bg-sky-50 text-sky-700 border-sky-200",
  Billed: "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Ready to Dispatch": "bg-purple-50 text-purple-700 border-purple-200",
  Dispatched: "bg-orange-50 text-orange-700 border-orange-200",
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-block px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-full border ${STATUS_STYLES[status] || "bg-slate-50 text-slate-600 border-slate-200"}`}
  >
    {status || "Pending"}
  </span>
);

// ═══════════════════════════════════════════════
//  APPROVE MODAL
// ═══════════════════════════════════════════════
const ApproveModal = ({ order, onClose, onConfirm, isSubmitting }) => {
  if (!order) return null;
  return (
    <Modal
      open={!!order}
      onClose={onClose}
      title="Approve Order"
      maxWidth="max-w-md"
    >
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-700 font-semibold mb-1">Order</p>
        <p className="text-sm font-bold text-slate-800 font-mono">
          {order.orderNumber}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          {order.dealerName} · {order.modelName} {order.bodyTypeName}
        </p>
        <p className="text-xs text-slate-500">
          Chassis: <span className="font-mono">{order.chassisNumber}</span>
        </p>
        <p className="text-xs text-slate-500">
          Amount:{" "}
          <span className="font-bold text-blue-700">
            {formatINR(order.totalAmount)}
          </span>
        </p>
      </div>

      <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
        <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider mb-1">
          Sub-Admin & Assembly
        </p>
        {order.subAdminName && (
          <p className="text-xs text-slate-600">
            Sub-Admin: <span className="font-bold">{order.subAdminName}</span>
          </p>
        )}
        {order.assembler && (
          <p className="text-xs text-slate-600">
            Assembled by:{" "}
            <span className="font-bold">{order.assembler.name}</span> (
            {order.assembler.id})
          </p>
        )}
      </div>

      <p className="text-xs text-slate-600 mb-4 p-3 bg-slate-50 rounded-lg">
        Once approved, this order will move to the billing team for invoice
        generation.
      </p>

      <div className="flex justify-end gap-3">
        <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
        <PrimaryButton
          onClick={onConfirm}
          disabled={isSubmitting}
          className="gap-2 !bg-emerald-600 hover:!bg-emerald-700"
        >
          <CheckCircle2 size={14} />
          {isSubmitting ? "Approving..." : "Approve Order"}
        </PrimaryButton>
      </div>
    </Modal>
  );
};

// ═══════════════════════════════════════════════
//  REJECT MODAL
// ═══════════════════════════════════════════════
const RejectModal = ({ order, onClose, onConfirm, isSubmitting }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!order) return null;

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError("Rejection reason is required.");
      return;
    }
    setError("");
    onConfirm(reason.trim());
  };

  return (
    <Modal
      open={!!order}
      onClose={onClose}
      title="Reject Order"
      maxWidth="max-w-md"
    >
      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-xs text-red-700 font-semibold mb-1">Order</p>
        <p className="text-sm font-bold text-slate-800 font-mono">
          {order.orderNumber}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          {order.dealerName} · {order.modelName} {order.bodyTypeName}
        </p>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-semibold mb-1.5 text-slate-700 uppercase tracking-wider">
          Rejection Reason <span className="text-red-500">*</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setError("");
          }}
          rows={3}
          placeholder="e.g. Battery specifications mismatch with dealer request..."
          className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
          autoFocus
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>

      <p className="text-xs text-slate-500 mb-4 p-3 bg-slate-50 rounded-lg">
        This reason will be shared with the sub-admin and dealer.
      </p>

      <div className="flex justify-end gap-3">
        <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
        <PrimaryButton
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="gap-2 !bg-red-600 hover:!bg-red-700"
        >
          <XCircle size={14} />
          {isSubmitting ? "Rejecting..." : "Reject Order"}
        </PrimaryButton>
      </div>
    </Modal>
  );
};

// ═══════════════════════════════════════════════
//  ORDER DETAIL MODAL (READ-ONLY)
// ═══════════════════════════════════════════════
const OrderDetailModal = ({ order, onClose, onApprove, onReject }) => {
  if (!order) return null;
  const o = order;
  const gst = gstBreakdown(o.totalAmount);

  const isPending = o.status === ORDER_STATUS.PENDING_APPROVAL;

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

  const TimelineRow = ({ icon: Icon, label, value, sub, done }) => (
    <div className="flex items-start gap-3">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          done
            ? "bg-emerald-100 text-emerald-600"
            : "bg-slate-100 text-slate-400"
        }`}
      >
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-xs font-semibold ${done ? "text-slate-800" : "text-slate-400"}`}
        >
          {label}
        </p>
        <p className="text-[11px] text-slate-500">
          {done ? (sub ? `${sub} · ${value || ""}` : value || "—") : "Not yet"}
        </p>
      </div>
    </div>
  );

  return (
    <Modal
      open={!!order}
      onClose={onClose}
      title="Order Details"
      maxWidth="max-w-3xl"
    >
      <div className="flex items-start justify-between mb-5 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText size={16} className="text-blue-600" />
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Order
            </span>
          </div>
          <p className="text-lg font-bold text-slate-800 font-mono">
            {o.orderNumber}
          </p>
          {o.chassisNumber && (
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Chassis: {o.chassisNumber}
            </p>
          )}
        </div>
        <StatusBadge status={o.status} />
      </div>

      {/* Dealer Information */}
      <h3 className="text-sm font-bold text-slate-800 mb-2">
        Dealer Information
      </h3>
      <div className="grid sm:grid-cols-2 gap-x-6 mb-5">
        <Row label="Dealer Name" value={o.dealerName} />
        <Row label="Dealer Code" value={o.dealerCode} mono />
        <Row label="GSTIN" value={o.dealerGstin} mono />
        <Row label="State" value={o.dealerState} />
        <Row label="District" value={o.dealerDistrict} />
        <Row label="Pin Code" value={o.dealerPinCode} />
        <div className="sm:col-span-2">
          <Row label="Address" value={o.dealerAddress} />
        </div>
      </div>

      {/* Vehicle Specification */}
      <h3 className="text-sm font-bold text-slate-800 mb-2">
        Vehicle Specification
      </h3>
      <div className="grid sm:grid-cols-2 gap-x-6 mb-5">
        <Row label="Vehicle Type" value={o.vehicleType} />
        <Row label="Model" value={o.modelName} />
        <Row label="Body Type" value={o.bodyTypeName} />
        <Row label="Color" value={o.colorName} />
        <Row label="Battery Type" value={o.batteryType} />
        <Row
          label="Specs"
          value={[
            o.batteryVolt && `${o.batteryVolt}V`,
            o.batteryAmpereHours && `${o.batteryAmpereHours}Ah`,
          ]
            .filter(Boolean)
            .join(" / ")}
        />
      </div>

      {/* Assembly Information */}
      {(o.assembler || o.subAdminName) && (
        <>
          <h3 className="text-sm font-bold text-slate-800 mb-2">
            Assembly Information
          </h3>
          <div className="mb-5 bg-orange-50 border border-orange-200 rounded-lg p-4">
            {o.subAdminName && (
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {o.subAdminName}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {o.subAdminId}
                  </p>
                </div>
              </div>
            )}
            {o.assembler && (
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <HardHat size={20} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {o.assembler.name}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {o.assembler.id} · {o.assembler.shift} Shift
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Approval Info */}
      {o.approvedOn && o.status !== ORDER_STATUS.REJECTED && (
        <>
          <h3 className="text-sm font-bold text-slate-800 mb-2">
            Approval Information
          </h3>
          <div className="grid sm:grid-cols-2 gap-x-6 mb-5 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <Row label="Approved By" value={o.approvedBy} />
            <Row label="Approved On" value={o.approvedOn} />
          </div>
        </>
      )}

      {/* Rejection Info */}
      {o.status === ORDER_STATUS.REJECTED && o.rejectionReason && (
        <>
          <h3 className="text-sm font-bold text-slate-800 mb-2">
            Rejection Information
          </h3>
          <div className="mb-5 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">Reason</p>
            <p className="text-sm text-red-700 font-medium">
              {o.rejectionReason}
            </p>
            {o.approvedOn && (
              <p className="text-xs text-slate-500 mt-2">
                Rejected on: {o.approvedOn} by {o.approvedBy}
              </p>
            )}
          </div>
        </>
      )}

      {/* Billing Info (read-only) */}
      {o.billNumber && (
        <>
          <h3 className="text-sm font-bold text-slate-800 mb-2">
            Billing Information
          </h3>
          <div className="grid sm:grid-cols-2 gap-x-6 mb-5 bg-indigo-50 border border-indigo-200 rounded-lg p-3">
            <Row label="Bill Number" value={o.billNumber} mono />
            <Row label="Billed On" value={o.billedOn} />
          </div>
        </>
      )}

      {/* Dispatch Info (read-only) */}
      {o.dispatchMode && (
        <>
          <h3 className="text-sm font-bold text-slate-800 mb-2">
            Dispatch Information
          </h3>
          <div className="grid sm:grid-cols-2 gap-x-6 mb-5 bg-orange-50 border border-orange-200 rounded-lg p-3">
            <Row label="Dispatch Mode" value={o.dispatchMode} />
            <Row label="Dispatched On" value={o.dispatchedOn} />
            {o.transportDetails && (
              <>
                <Row label="Transport Name" value={o.transportDetails.name} />
                <Row label="Contact" value={o.transportDetails.contact} />
              </>
            )}
          </div>
        </>
      )}

      {/* Delivery Info (read-only) */}
      {o.deliveredOn && (
        <>
          <h3 className="text-sm font-bold text-slate-800 mb-2">
            Delivery Information
          </h3>
          <div className="grid sm:grid-cols-2 gap-x-6 mb-5 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <Row label="Delivered On" value={o.deliveredOn} />
          </div>
        </>
      )}

      {/* Timeline */}
      <h3 className="text-sm font-bold text-slate-800 mb-3">
        Workflow Timeline
      </h3>
      <div className="bg-slate-50 rounded-lg p-4 mb-5">
        <div className="space-y-3">
          <TimelineRow
            icon={FileText}
            label="Order Placed"
            value={o.createdOn}
            sub={o.createdBy}
            done={true}
          />
          <TimelineRow
            icon={HardHat}
            label="Assembly & Chassis Assigned"
            value={o.assembledOn}
            sub={o.assembler?.name}
            done={!!o.assembler}
          />
          <TimelineRow
            icon={CheckCircle2}
            label="Admin Approval"
            value={o.approvedOn}
            sub={o.approvedBy}
            done={!!o.approvedOn && o.status !== ORDER_STATUS.REJECTED}
          />
          <TimelineRow
            icon={XCircle}
            label="Rejected"
            value={o.approvedOn}
            sub={o.rejectionReason}
            done={o.status === ORDER_STATUS.REJECTED}
          />
          <TimelineRow
            icon={FileText}
            label="Bill Generated"
            value={o.billedOn}
            sub={o.billNumber}
            done={!!o.billNumber}
          />
          <TimelineRow
            icon={Truck}
            label="Dispatched"
            value={o.dispatchedOn}
            sub={o.dispatchMode}
            done={!!o.dispatchedOn}
          />
          <TimelineRow
            icon={Package}
            label="Delivered"
            value={o.deliveredOn}
            done={!!o.deliveredOn}
          />
        </div>
      </div>

      {/* Price Breakdown */}
      <h3 className="text-sm font-bold text-slate-800 mb-2">Price Breakdown</h3>
      <div className="bg-slate-50 rounded-lg p-4">
        <Row label="Model Price" value={formatINR(o.modelPrice)} />
        <Row label="Body Type Price" value={formatINR(o.bodyTypePrice)} />
        <Row label="Battery Price" value={formatINR(o.batteryPrice)} />
        <div className="my-2 border-t border-slate-200" />
        <Row label="Subtotal (excl. GST)" value={formatINR(gst.subtotal)} />
        <Row label="CGST (2.5%)" value={formatINR(gst.cgst)} />
        <Row label="SGST (2.5%)" value={formatINR(gst.sgst)} />
        <div className="my-2 border-t-2 border-slate-300" />
        <div className="flex justify-between py-2">
          <span className="text-sm font-bold text-slate-800">Total Amount</span>
          <span className="text-lg font-bold text-blue-600">
            {formatINR(o.totalAmount)}
          </span>
        </div>
      </div>

      {/* Actions — sirf Pending Approval pe */}
      <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-slate-200">
        <button
          onClick={onClose}
          className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Close
        </button>
        {isPending && (
          <>
            <button
              onClick={onReject}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all active:scale-95 flex items-center gap-2"
            >
              <XCircle size={14} />
              Reject
            </button>
            <button
              onClick={onApprove}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all active:scale-95 flex items-center gap-2"
            >
              <CheckCircle2 size={14} />
              Approve
            </button>
          </>
        )}
      </div>
    </Modal>
  );
};

// ═══════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════
const Orders = () => {
  const { role } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();
  const urlStatus = searchParams.get("status") || "all";

  const [statusFilter, setStatusFilter] = useState(urlStatus);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [banner, setBanner] = useState(null);

  const [approvingOrder, setApprovingOrder] = useState(null);
  const [rejectingOrder, setRejectingOrder] = useState(null);

  const { data: ordersData, loading, error } = useOrders();

  const orders = ordersData ?? [];

  const approveMutation = useApproveOrder();
  const rejectMutation = useRejectOrder();

  useEffect(() => {
    setStatusFilter(urlStatus);
    setSelectedOrder(null);
  }, [urlStatus]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      return true;
    });
  }, [orders, statusFilter]);

  const pagination = usePagination(filtered, 25);

  const hasActiveFilters = statusFilter !== "all";

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    if (value === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ status: value });
    }
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setSearchParams({});
    pagination.reset();
  };

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === ORDER_STATUS.PENDING_APPROVAL)
        .length,
      approved: orders.filter((o) => o.status === ORDER_STATUS.APPROVED).length,
      billing: orders.filter(
        (o) => o.status === ORDER_STATUS.BILLING_IN_PROGRESS,
      ).length,
      billed: orders.filter((o) => o.status === ORDER_STATUS.BILLED).length,
      ready: orders.filter((o) => o.status === ORDER_STATUS.READY_TO_DISPATCH)
        .length,
      dispatched: orders.filter((o) => o.status === ORDER_STATUS.DISPATCHED)
        .length,
      delivered: orders.filter((o) => o.status === ORDER_STATUS.DELIVERED)
        .length,
      rejected: orders.filter((o) => o.status === ORDER_STATUS.REJECTED).length,
    };
  }, [orders]);

  // ── Handlers ──
  const handleApprove = async () => {
    setBanner(null);
    try {
      await approveMutation.mutateAsync(approvingOrder.id);
      setBanner({
        type: "success",
        text: `Order ${approvingOrder.orderNumber} approved.`,
      });
      setApprovingOrder(null);
      setSelectedOrder(null);
    } catch (err) {
      setBanner({
        type: "error",
        text:
          err?.response?.data?.message ||
          "Couldn't approve this order. Please try again.",
      });
    }
  };

  const handleReject = async (reason) => {
    setBanner(null);
    try {
      await rejectMutation.mutateAsync({
        id: rejectingOrder.id,
        payload: { reason },
      });
      setBanner({
        type: "success",
        text: `Order ${rejectingOrder.orderNumber} rejected.`,
      });
      setRejectingOrder(null);
      setSelectedOrder(null);
    } catch (err) {
      setBanner({
        type: "error",
        text:
          err?.response?.data?.message ||
          "Couldn't reject this order. Please try again.",
      });
    }
  };

  // ── Action resolver — SIRF Pending Approval pe ──
  const getActionForOrder = (order) => {
    if (order.status === ORDER_STATUS.PENDING_APPROVAL) {
      return {
        label: "Review & Approve",
        icon: <ShieldCheck size={14} />,
        color: "#3b82f6",
        handler: () => setApprovingOrder(order),
      };
    }
    return null;
  };

  const columns = useMemo(
    () => [
      {
        key: "orderNumber",
        label: "Order #",
        className: "font-mono text-xs font-bold",
      },
      {
        key: "chassisNumber",
        label: "Chassis",
        render: (row) =>
          row.chassisNumber ? (
            <span className="font-mono text-xs">{row.chassisNumber}</span>
          ) : (
            <span className="text-slate-400 italic text-xs">Not assigned</span>
          ),
      },
      {
        key: "dealerName",
        label: "Dealer",
        render: (row) => (
          <div>
            <p className="font-medium text-slate-800">{row.dealerName}</p>
            <p className="text-[11px] text-slate-500 font-mono">
              {row.dealerCode}
            </p>
          </div>
        ),
      },
      {
        key: "subAdminName",
        label: "Sub-Admin",
        render: (row) =>
          row.subAdminName ? (
            <div>
              <p className="font-medium text-slate-800 text-xs">
                {row.subAdminName}
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                {row.subAdminId}
              </p>
            </div>
          ) : (
            <span className="text-slate-400 italic text-xs">—</span>
          ),
      },
      { key: "modelName", label: "Model" },
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
        render: (row) => {
          const isPending = row.status === ORDER_STATUS.PENDING_APPROVAL;
          return (
            <div className="flex items-center gap-1">
              {/* Eye — hamesha dikhega */}
              <button
                onClick={() => setSelectedOrder(row)}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                aria-label="View details"
              >
                <Eye size={16} />
              </button>

              {/* Approve + Reject — sirf Pending Approval pe */}
              {isPending && (
                <>
                  <button
                    onClick={() => setApprovingOrder(row)}
                    className="p-1.5 rounded-md transition-colors text-white bg-emerald-600 hover:bg-emerald-700"
                    title="Approve"
                    aria-label="Approve order"
                  >
                    <CheckCircle2 size={16} />
                  </button>
                  <button
                    onClick={() => setRejectingOrder(row)}
                    className="p-1.5 rounded-md transition-colors text-white bg-red-600 hover:bg-red-700"
                    title="Reject"
                    aria-label="Reject order"
                  >
                    <XCircle size={16} />
                  </button>
                </>
              )}
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: ORDER_STATUS.PENDING_APPROVAL, label: "Pending Approval" },
    { value: ORDER_STATUS.APPROVED, label: "Approved" },
    { value: ORDER_STATUS.REJECTED, label: "Rejected" },
    {
      value: ORDER_STATUS.BILLING_IN_PROGRESS,
      label: "Billing in Progress",
    },
    { value: ORDER_STATUS.BILLED, label: "Billed" },
    { value: ORDER_STATUS.READY_TO_DISPATCH, label: "Ready to Dispatch" },
    { value: ORDER_STATUS.DISPATCHED, label: "Dispatched" },
    { value: ORDER_STATUS.DELIVERED, label: "Delivered" },
  ];

  return (
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
          Orders
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Review and approve orders. Billing, dispatch and delivery are handled
          by respective teams.
        </p>
      </div>

      {banner && <Banner type={banner.type}>{banner.text}</Banner>}

      {loading ? (
        <LoadingCard rows={6} />
      ) : error ? (
        <ErrorCard message={error} />
      ) : (
        <>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2 mb-6">
            <Card className="p-3">
              <p className="text-[10px] text-slate-500 mb-0.5 uppercase tracking-wider font-semibold">
                Total
              </p>
              <p className="text-xl font-bold text-slate-800 tabular">
                {stats.total}
              </p>
            </Card>
            <Card className="p-3">
              <p className="text-[10px] text-amber-600 mb-0.5 uppercase tracking-wider font-semibold">
                Pending
              </p>
              <p className="text-xl font-bold text-amber-600 tabular">
                {stats.pending}
              </p>
            </Card>
            <Card className="p-3">
              <p className="text-[10px] text-blue-600 mb-0.5 uppercase tracking-wider font-semibold">
                Approved
              </p>
              <p className="text-xl font-bold text-blue-600 tabular">
                {stats.approved}
              </p>
            </Card>
            <Card className="p-3">
              <p className="text-[10px] text-sky-600 mb-0.5 uppercase tracking-wider font-semibold">
                In Billing
              </p>
              <p className="text-xl font-bold text-sky-600 tabular">
                {stats.billing}
              </p>
            </Card>
            <Card className="p-3">
              <p className="text-[10px] text-indigo-600 mb-0.5 uppercase tracking-wider font-semibold">
                Billed
              </p>
              <p className="text-xl font-bold text-indigo-600 tabular">
                {stats.billed}
              </p>
            </Card>
            <Card className="p-3">
              <p className="text-[10px] text-purple-600 mb-0.5 uppercase tracking-wider font-semibold">
                Ready
              </p>
              <p className="text-xl font-bold text-purple-600 tabular">
                {stats.ready}
              </p>
            </Card>
            <Card className="p-3">
              <p className="text-[10px] text-orange-600 mb-0.5 uppercase tracking-wider font-semibold">
                Dispatch
              </p>
              <p className="text-xl font-bold text-orange-600 tabular">
                {stats.dispatched}
              </p>
            </Card>
            <Card className="p-3">
              <p className="text-[10px] text-emerald-600 mb-0.5 uppercase tracking-wider font-semibold">
                Delivered
              </p>
              <p className="text-xl font-bold text-emerald-600 tabular">
                {stats.delivered}
              </p>
            </Card>
            <Card className="p-3">
              <p className="text-[10px] text-red-600 mb-0.5 uppercase tracking-wider font-semibold">
                Rejected
              </p>
              <p className="text-xl font-bold text-red-600 tabular">
                {stats.rejected}
              </p>
            </Card>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
            <FilterSelect
              label="Filter by status"
              value={statusFilter}
              onChange={handleStatusChange}
              options={statusOptions}
              className="w-full lg:w-64"
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
              {pagination.total === 1 ? "order" : "orders"}
            </p>
          </div>

          <DataTable
            columns={columns}
            rows={pagination.pageItems}
            rowKey={(row) => row.id ?? row.orderNumber}
            emptyText={
              orders.length === 0
                ? "No orders yet."
                : "No orders match your filters."
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

      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onApprove={() => {
          setApprovingOrder(selectedOrder);
        }}
        onReject={() => {
          setRejectingOrder(selectedOrder);
        }}
      />

      <ApproveModal
        order={approvingOrder}
        onClose={() => setApprovingOrder(null)}
        onConfirm={handleApprove}
        isSubmitting={approveMutation.isPending}
      />
      <RejectModal
        order={rejectingOrder}
        onClose={() => setRejectingOrder(null)}
        onConfirm={handleReject}
        isSubmitting={rejectMutation.isPending}
      />
    </section>
  );
};

export default Orders;
