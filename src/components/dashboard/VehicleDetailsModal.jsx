import {
  Package,
  MapPin,
  Battery,
  Calendar,
  User,
  HardHat,
} from "lucide-react";
import Modal from "../ui/Modal";

const ASSEMBLY_STYLES = {
  Unassembled: "bg-amber-50 text-amber-700 border-amber-200",
  Assembled: "bg-blue-50 text-blue-700 border-blue-200",
  "Ready to Dispatch": "bg-purple-50 text-purple-700 border-purple-200",
  Dispatched: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const VehicleDetailsModal = ({ vehicle, onClose }) => {
  if (!vehicle) return null;
  const v = vehicle;

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

  const roleLabel = (role) =>
    role === "subadmin"
      ? "Sub-Admin"
      : role === "admin"
        ? "Admin"
        : role || "—";

  return (
    <Modal
      open={!!vehicle}
      onClose={onClose}
      title="Vehicle Details"
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Package size={16} className="text-blue-600" />
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                Vehicle
              </span>
            </div>
            <p className="text-lg font-black text-slate-800 font-mono">
              {v.chassisNumber || (
                <span className="text-slate-400 italic text-sm font-sans">
                  Chassis not yet assigned
                </span>
              )}
            </p>
          </div>
          <span
            className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-full border ${ASSEMBLY_STYLES[v.assemblyStatus] || "bg-slate-50 text-slate-600 border-slate-200"}`}
          >
            {v.assemblyStatus}
          </span>
        </div>

        {/* Vehicle Details */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 rounded-full bg-blue-500" />
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              Vehicle Details
            </p>
          </div>
          <Row label="Model" value={v.modelName} />
          <Row label="Body Type" value={v.bodyTypeName} />
          <Row label="Color" value={v.colorName} />
          <Row
            label="Battery"
            value={[
              v.batteryType,
              v.batteryVolt && `${v.batteryVolt}V`,
              v.batteryAmpereHours && `${v.batteryAmpereHours}Ah`,
            ]
              .filter(Boolean)
              .join(" / ")}
            icon={Battery}
          />
        </div>

        {/* Assembled By (only if assembled) */}
        {v.assembledBy && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 rounded-full bg-orange-500" />
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                Assembled By
              </p>
            </div>
            <Row
              label="Worker Name"
              value={v.assembledBy.name}
              icon={HardHat}
            />
            <Row label="Worker ID" value={v.assembledBy.id} mono />
            {v.assembledOn && (
              <Row label="Assembled On" value={v.assembledOn} icon={Calendar} />
            )}
          </div>
        )}

        {/* Added By */}
        {v.addedBy && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 rounded-full bg-slate-400" />
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                Added By
              </p>
            </div>
            {typeof v.addedBy === "object" ? (
              <>
                <Row label="Name" value={v.addedBy.name} icon={User} />
                <Row label="Role" value={roleLabel(v.addedBy.role)} />
                {v.addedOn && (
                  <Row label="Added On" value={v.addedOn} icon={Calendar} />
                )}
              </>
            ) : (
              <Row label="Added By" value={v.addedBy} />
            )}
          </div>
        )}

        {/* Dealer Info (if assigned) */}
        {v.dealerName && v.dealerName !== "—" && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 rounded-full bg-emerald-500" />
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                Dealer Information
              </p>
            </div>
            <Row label="Dealer Name" value={v.dealerName} icon={User} />
            {v.dealerCode && v.dealerCode !== "—" && (
              <Row label="Dealer Code" value={v.dealerCode} mono />
            )}
            {v.dealerState && (
              <Row
                label="Location"
                value={`${v.dealerDistrict || ""}, ${v.dealerState}`}
                icon={MapPin}
              />
            )}
            {v.billNumber && (
              <Row label="Bill Number" value={v.billNumber} mono />
            )}
            {v.dispatchedOn && (
              <Row
                label="Dispatched On"
                value={v.dispatchedOn}
                icon={Calendar}
              />
            )}
          </div>
        )}

        {/* Customer Info (if sold) */}
        {v.customerName && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 rounded-full bg-purple-500" />
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                Customer Information
              </p>
            </div>
            <Row label="Customer" value={v.customerName} icon={User} />
            {v.customerMobile && (
              <Row label="Mobile" value={v.customerMobile} />
            )}
            {v.customerEmail && <Row label="Email" value={v.customerEmail} />}
            {v.deliveredOn && (
              <Row label="Delivered On" value={v.deliveredOn} icon={Calendar} />
            )}
            {v.warrantyStart && v.warrantyEnd && (
              <Row
                label="Warranty"
                value={`${v.warrantyStart} → ${v.warrantyEnd}`}
              />
            )}
          </div>
        )}

        {/* Storage Info (if in stock) */}
        {(v.storageLocation || v.addedOn) && !v.dealerName && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 rounded-full bg-amber-500" />
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                Storage Info
              </p>
            </div>
            {v.storageLocation && (
              <Row label="Location" value={v.storageLocation} icon={MapPin} />
            )}
          </div>
        )}

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

export default VehicleDetailsModal;
