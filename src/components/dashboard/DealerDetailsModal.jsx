import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import Modal from "../ui/Modal";

const DealerDetailsModal = ({ dealer, onClose }) => {
  if (!dealer) return null;
  const d = dealer;

  const Row = ({ label, value, mono, icon: Icon }) => {
    let safeValue = value;
    if (value === null || value === undefined || value === "") {
      safeValue = "—";
    } else if (typeof value === "object") {
      safeValue = value.name || "—";
    }

    return (
      <div className="flex justify-between py-2.5 border-b border-slate-100 last:border-0">
        <span className="text-xs text-slate-500 flex items-center gap-1.5">
          {Icon && <Icon size={12} className="text-slate-400" />}
          {label}
        </span>
        <span
          className={`text-sm text-slate-800 font-medium text-right ${mono ? "font-mono text-xs" : ""}`}
        >
          {safeValue}
        </span>
      </div>
    );
  };

  return (
    <Modal
      open={!!dealer}
      onClose={onClose}
      title="Dealer Details"
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        <div className="flex items-start justify-between pb-5 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 size={16} className="text-blue-600" />
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                Dealer
              </span>
            </div>
            <p className="text-lg font-black text-slate-800">{d.name}</p>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {d.dealerCode}
            </p>
          </div>
          {d.activationCode ? (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 size={10} /> Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              <Clock size={10} /> Pending
            </span>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 rounded-full bg-blue-500" />
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              Contact Information
            </p>
          </div>
          <Row label="Contact Name" value={d.name} icon={User} />
          <Row label="Mobile" value={d.mobileNo} icon={Phone} />
          <Row label="Email" value={d.emailId} icon={Mail} />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 rounded-full bg-purple-500" />
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              Business Information
            </p>
          </div>
          <Row label="GSTIN" value={d.gstin} mono />
          <Row label="Activation Code" value={d.activationCode} mono />
          <Row label="LOI Reference" value={d.LOIreferenceId} mono />
          <Row label="RQ Reference" value={d.RQreferenceId} mono />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 rounded-full bg-emerald-500" />
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              Location & RTO
            </p>
          </div>
          <Row label="Address" value={d.address} icon={MapPin} />
          <Row label="District" value={d.dist} />
          <Row label="State" value={d.state} />
          <Row label="Pin Code" value={d.pinCode} />
          <Row label="RTO Office" value={d.rtoOffice} icon={Building2} />
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default DealerDetailsModal;
