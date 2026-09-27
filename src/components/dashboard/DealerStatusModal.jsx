import { useState } from "react";
import { CheckCircle2, Clock, XCircle, ChevronRight } from "lucide-react";
import Modal from "../ui/Modal";
import CountUp from "./shared/CountUp";
import DealersListModal from "./DealersListModal";

const STATUS_META = {
  Active: {
    icon: CheckCircle2,
    desc: "Verified & trading dealers",
    color: "#10b981",
    gradient: "from-emerald-500 to-green-600",
    filterKey: "active",
  },
  Pending: {
    icon: Clock,
    desc: "Awaiting approval",
    color: "#f59e0b",
    gradient: "from-amber-500 to-orange-600",
    filterKey: "pending",
  },
  Suspended: {
    icon: XCircle,
    desc: "Temporarily blocked",
    color: "#ef4444",
    gradient: "from-red-500 to-rose-600",
    filterKey: "suspended",
  },
};

const DealerStatusModal = ({ status, onClose }) => {
  const [listFilter, setListFilter] = useState(null);

  if (!status) return null;

  const meta = STATUS_META[status.label] || STATUS_META.Active;
  const Icon = meta.icon;

  const openList = () => {
    setListFilter({
      status: meta.filterKey,
      title: `${status.label} Dealers`,
    });
  };

  return (
    <>
      <Modal
        open={!!status}
        onClose={onClose}
        title={`${status.label} Dealers`}
        subtitle={`${status.value} dealers`}
        maxWidth="max-w-lg"
      >
        <div className="mb-5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <p className="text-xs text-slate-600">
            Click "View Full List" to see all {status.label.toLowerCase()}{" "}
            dealers with filters.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl p-5 shadow-lg mb-4">
          <div
            className={`absolute inset-0 bg-gradient-to-br ${meta.gradient}`}
          />
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/20 blur-2xl" />

          <div className="relative z-10 flex items-center gap-4 text-white">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center shrink-0">
              <Icon size={26} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-white/80 uppercase tracking-wider mb-1">
                {status.label} Dealers
              </p>
              <p className="text-4xl font-black tabular leading-none">
                <CountUp end={status.value} />
              </p>
              <p className="text-[10px] text-white/70 mt-1">{meta.desc}</p>
            </div>
          </div>
        </div>

        <button
          onClick={openList}
          className="group w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] overflow-hidden relative"
          style={{ backgroundColor: meta.color }}
        >
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <span className="relative z-10 flex items-center gap-2">
            View Full List
            <ChevronRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </span>
        </button>
      </Modal>

      <DealersListModal
        filter={listFilter}
        onClose={() => setListFilter(null)}
      />
    </>
  );
};

export default DealerStatusModal;
