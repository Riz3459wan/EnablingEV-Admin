import { useState } from "react";
import { CheckCircle2, Wrench, ChevronRight } from "lucide-react";
import Modal from "../ui/Modal";
import CountUp from "./shared/CountUp";
import VehiclesListModal from "./VehiclesListModal";

const AssemblyStatusModal = ({ vehicleType, onClose }) => {
  const [listFilter, setListFilter] = useState(null);

  if (!vehicleType) return null;

  const { label, value, assembly, key, color } = vehicleType;
  const assembled = assembly?.assembled || 0;
  const unassembled = assembly?.unassembled || 0;
  const total = assembled + unassembled;

  const openList = (status) => {
    setListFilter({
      vehicleTypeKey: key === "erikshaw" ? "rikshaw" : "cargo",
      assemblyStatus: status.toLowerCase(),
      title: `${label} · ${status}`,
    });
  };

  return (
    <>
      <Modal
        open={!!vehicleType}
        onClose={onClose}
        title={`${label} — Assembly Status`}
        subtitle={`${value} total vehicles`}
        maxWidth="max-w-lg"
      >
        <div className="mb-5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <p className="text-xs text-slate-600">
            Click on Assembled or Unassembled to view the complete list with
            filters.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Assembled */}
          <button
            onClick={() => openList("Assembled")}
            className="group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
          >
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/20 blur-2xl animate-pulse-slow" />
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="relative z-10 text-left">
              <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <CheckCircle2 size={20} />
              </div>
              <p className="text-[10px] font-semibold text-white/80 uppercase tracking-wider mb-1">
                Assembled
              </p>
              <p className="text-3xl font-black tabular leading-none mb-1">
                <CountUp end={assembled} />
              </p>
              <p className="text-[10px] text-white/70">Ready to dispatch</p>
              <div className="flex items-center gap-1 mt-3 text-[10px] font-bold text-white/90">
                View breakdown
                <ChevronRight
                  size={11}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </div>
            </div>
          </button>

          {/* Unassembled */}
          <button
            onClick={() => openList("Unassembled")}
            className="group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
          >
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/20 blur-2xl animate-pulse-slow" />
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="relative z-10 text-left">
              <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Wrench size={20} />
              </div>
              <p className="text-[10px] font-semibold text-white/80 uppercase tracking-wider mb-1">
                Unassembled
              </p>
              <p className="text-3xl font-black tabular leading-none mb-1">
                <CountUp end={unassembled} />
              </p>
              <p className="text-[10px] text-white/70">In kit form</p>
              <div className="flex items-center gap-1 mt-3 text-[10px] font-bold text-white/90">
                View breakdown
                <ChevronRight
                  size={11}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </div>
            </div>
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-5 p-3 bg-slate-50 rounded-xl">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-500 font-medium">
              Assembly Progress
            </span>
            <span className="font-bold text-slate-800">
              {total > 0 ? Math.round((assembled / total) * 100) : 0}% complete
            </span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 transition-all duration-1000"
              style={{ width: `${total > 0 ? (assembled / total) * 100 : 0}%` }}
            />
            <div
              className="h-full bg-amber-500 transition-all duration-1000"
              style={{
                width: `${total > 0 ? (unassembled / total) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </Modal>

      {/* ✅ Modal 2: Vehicles List */}
      <VehiclesListModal
        filter={listFilter}
        onClose={() => setListFilter(null)}
      />
    </>
  );
};

export default AssemblyStatusModal;
