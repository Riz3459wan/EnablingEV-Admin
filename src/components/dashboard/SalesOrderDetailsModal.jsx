import {
  Package,
  User,
  Building2,
  Calendar,
  MapPin,
  Battery,
  Truck,
  FileText,
  Download,
  CheckCircle2,
  Home,
} from "lucide-react";
import Modal from "../ui/Modal";
import { PrimaryButton } from "../ui/Button";
import { formatINR, gstBreakdown } from "../../features/quotation/calc";
import { generateInvoicePDF } from "../../features/invoice/generateInvoice";

const SalesOrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;
  const o = order;
  const gst = gstBreakdown(o.totalAmount);
  const hasBill = !!o.billNumber;

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
      title={hasBill ? "Invoice Details" : "Order Details"}
      subtitle={o.orderNumber}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Package size={16} className="text-emerald-600" />
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                Delivered Vehicle
              </span>
            </div>
            <p className="text-lg font-black text-slate-800 font-mono">
              {o.chassisNumber || "—"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {o.billNumber && (
                <span className="font-mono">Bill: {o.billNumber} · </span>
              )}
              Delivered {o.deliveredOn}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
              {hasBill ? "Invoice Amount" : "Order Amount"}
            </p>
            <p className="text-2xl font-black text-emerald-600 tabular">
              {formatINR(o.totalAmount)}
            </p>
          </div>
        </div>

        {/* Vehicle Info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 rounded-full bg-blue-500" />
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              Vehicle
            </p>
          </div>
          <Row label="Model" value={o.modelName} icon={Package} />
          <Row label="Body Type" value={o.bodyTypeName} />
          <Row label="Color" value={o.colorName} />
          <Row
            label="Battery"
            value={[
              o.batteryType,
              o.batteryVolt && `${o.batteryVolt}V`,
              o.batteryAmpereHours && `${o.batteryAmpereHours}Ah`,
            ]
              .filter(Boolean)
              .join(" / ")}
            icon={Battery}
          />
        </div>

        {/* Dealer */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 rounded-full bg-purple-500" />
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              Dealer
            </p>
          </div>
          <Row label="Dealer Name" value={o.dealerName} icon={Building2} />
          <Row label="Dealer Code" value={o.dealerCode} mono />
          <Row label="GSTIN" value={o.dealerGstin} mono />
          {o.dealerState && (
            <Row
              label="Location"
              value={`${o.dealerDistrict || ""}, ${o.dealerState}`}
              icon={MapPin}
            />
          )}
        </div>

        {/* Customer */}
        {o.customerName && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 rounded-full bg-cyan-500" />
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                Customer
              </p>
            </div>
            <Row label="Name" value={o.customerName} icon={User} />
            {o.customerMobile && (
              <Row label="Mobile" value={o.customerMobile} />
            )}
            {o.customerEmail && <Row label="Email" value={o.customerEmail} />}
            {o.customerAddress && (
              <Row label="Address" value={o.customerAddress} icon={Home} />
            )}
          </div>
        )}

        {/* Delivery Info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 rounded-full bg-emerald-500" />
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              Delivery
            </p>
          </div>
          <Row label="Delivered On" value={o.deliveredOn} icon={Calendar} />
          <Row label="Dispatch Mode" value={o.dispatchMode} icon={Truck} />
          {o.transportDetails && (
            <>
              <Row label="Transport" value={o.transportDetails.name} />
              <Row label="Contact" value={o.transportDetails.contact} />
            </>
          )}
          {o.warrantyStart && o.warrantyEnd && (
            <Row
              label="Warranty"
              value={`${o.warrantyStart} → ${o.warrantyEnd}`}
            />
          )}
        </div>

        {/* Billing Info */}
        {hasBill && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 rounded-full bg-indigo-500" />
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                Billing
              </p>
            </div>
            <Row label="Bill Number" value={o.billNumber} mono />
            <Row label="Billed On" value={o.billedOn} icon={Calendar} />
          </div>
        )}

        {/* Price Breakdown */}
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
            <span className="text-sm font-bold text-slate-800">
              Grand Total
            </span>
            <span className="text-lg font-black text-emerald-600 tabular">
              {formatINR(o.totalAmount)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          {hasBill && (
            <PrimaryButton
              onClick={() => generateInvoicePDF(o)}
              className="gap-2 !bg-indigo-600 hover:!bg-indigo-700"
            >
              <Download size={14} />
              Download Invoice
            </PrimaryButton>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SalesOrderDetailsModal;
