import {
  FileText,
  Download,
  User,
  Building2,
  Calendar,
  Package,
} from "lucide-react";
import Modal from "../ui/Modal";
import { PrimaryButton, SecondaryButton } from "../ui/Button";
import { formatINR } from "../../features/quotation/calc";
import { generateInvoicePDF } from "../../features/invoice/generateInvoice";

const InvoiceDetailsModal = ({ order, onClose }) => {
  if (!order) return null;
  const o = order;

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

  const handleDownload = () => {
    generateInvoicePDF(o);
  };

  return (
    <Modal
      open={!!order}
      onClose={onClose}
      title="Invoice Details"
      subtitle={o.billNumber}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText size={16} className="text-indigo-600" />
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                Invoice
              </span>
            </div>
            <p className="text-lg font-black text-slate-800 font-mono">
              {o.billNumber}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Billed on {o.billedOn}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
              Total Amount
            </p>
            <p className="text-2xl font-black text-indigo-600 tabular">
              {formatINR(o.totalAmount)}
            </p>
          </div>
        </div>

        {/* Dealer Info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 rounded-full bg-blue-500" />
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              Dealer Information
            </p>
          </div>
          <Row label="Dealer Name" value={o.dealerName} icon={Building2} />
          <Row label="Dealer Code" value={o.dealerCode} mono />
          <Row label="GSTIN" value={o.dealerGstin} mono />
          <Row
            label="Address"
            value={`${o.dealerAddress || ""}, ${o.dealerDistrict || ""}, ${o.dealerState || ""} - ${o.dealerPinCode || ""}`}
          />
        </div>

        {/* Customer Info */}
        {(o.customerName || o.customerMobile) && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 rounded-full bg-emerald-500" />
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                Customer Information
              </p>
            </div>
            <Row label="Customer Name" value={o.customerName} icon={User} />
            <Row label="Mobile" value={o.customerMobile} />
            <Row label="Email" value={o.customerEmail} />
          </div>
        )}

        {/* Vehicle Info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 rounded-full bg-purple-500" />
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              Vehicle Information
            </p>
          </div>
          <Row label="Order Number" value={o.orderNumber} mono />
          <Row label="Chassis Number" value={o.chassisNumber} mono />
          <Row label="Model" value={o.modelName} icon={Package} />
          <Row label="Body Type" value={o.bodyTypeName} />
          <Row label="Color" value={o.colorName} />
          <Row
            label="Battery"
            value={`${o.batteryType || ""} ${o.batteryVolt ? `· ${o.batteryVolt}V` : ""} ${o.batteryAmpereHours ? `· ${o.batteryAmpereHours}Ah` : ""}`}
          />
        </div>

        {/* Price Breakdown */}
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 rounded-full bg-amber-500" />
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              Price Breakdown
            </p>
          </div>
          <Row label="Model Price" value={formatINR(o.modelPrice)} />
          <Row label="Body Type Price" value={formatINR(o.bodyTypePrice)} />
          <Row label="Battery Price" value={formatINR(o.batteryPrice)} />
          <div className="my-2 border-t border-slate-200" />
          <div className="flex justify-between py-1">
            <span className="text-sm font-bold text-slate-800">
              Grand Total
            </span>
            <span className="text-lg font-black text-indigo-600">
              {formatINR(o.totalAmount)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <SecondaryButton onClick={onClose} className="gap-2">
            Close
          </SecondaryButton>
          <PrimaryButton
            onClick={handleDownload}
            className="gap-2 !bg-indigo-600 hover:!bg-indigo-700"
          >
            <Download size={14} />
            Download Invoice
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
};

export default InvoiceDetailsModal;
