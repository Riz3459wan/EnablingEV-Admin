import { Car, Package, ChevronRight, TrendingUp } from "lucide-react";
import Modal from "../ui/Modal";
import CountUp from "./shared/CountUp";

const VehicleTypeSelectModal = ({ open, onClose, onSelect, vehicleTypes }) => {
  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Select Vehicle Type"
      subtitle="Choose a vehicle type to view assembly status"
      maxWidth="max-w-lg"
    >
      <div className="grid grid-cols-2 gap-3">
        {vehicleTypes.map((type, i) => {
          const Icon = type.key === "erikshaw" ? Car : Package;
          const assembled = type.assembly?.assembled || 0;
          const unassembled = type.assembly?.unassembled || 0;

          return (
            <button
              key={type.key}
              onClick={() => onSelect(type)}
              className="group relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-[0.98] animate-slide-up"
              style={{
                animationDelay: `${i * 80}ms`,
                background: `linear-gradient(135deg, ${type.color}15, ${type.color}05)`,
                border: `2px solid ${type.color}40`,
              }}
            >
              <div
                className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-30 animate-pulse-slow"
                style={{ backgroundColor: type.color }}
              />
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

              <div className="relative z-10">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                  style={{
                    backgroundColor: `${type.color}25`,
                    color: type.color,
                    boxShadow: `0 0 0 1px ${type.color}40`,
                  }}
                >
                  <Icon size={22} />
                </div>

                <p className="text-sm font-black text-slate-800 mb-0.5">
                  {type.label}
                </p>
                <p
                  className="text-2xl font-black tabular leading-tight"
                  style={{ color: type.color }}
                >
                  <CountUp end={type.value} />
                </p>
                <p className="text-[10px] text-slate-500 mb-3">
                  total vehicles
                </p>

                {/* Assembly split mini bar */}
                <div className="h-1.5 bg-white/60 rounded-full overflow-hidden flex mb-1.5">
                  <div
                    className="h-full transition-all duration-1000"
                    style={{
                      width: `${type.value > 0 ? (assembled / type.value) * 100 : 0}%`,
                      backgroundColor: "#10b981",
                    }}
                  />
                  <div
                    className="h-full transition-all duration-1000"
                    style={{
                      width: `${type.value > 0 ? (unassembled / type.value) * 100 : 0}%`,
                      backgroundColor: "#f59e0b",
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[9px] font-bold mb-2">
                  <span className="text-emerald-600">{assembled} ✅</span>
                  <span className="text-amber-600">{unassembled} 🔧</span>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-700 group-hover:text-slate-900">
                  View Assembly
                  <ChevronRight
                    size={11}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Modal>
  );
};

export default VehicleTypeSelectModal;
