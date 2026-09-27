import { useState } from "react";
import { Users, MapPin, ArrowUpRight } from "lucide-react";
import CountUp from "./shared/CountUp";
import DealerStatusModal from "./DealerStatusModal";
import DealersListModal from "./DealersListModal";

const STATE_COLORS = [
  "#3b82f6",
  "#10b981",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#6366f1",
  "#84cc16",
  "#a855f7",
];

const DealersSection = ({ dealers: DEALERS }) => {
  const [statusModalFor, setStatusModalFor] = useState(null);
  const [stateModalFor, setStateModalFor] = useState(null);

  if (!DEALERS) return null;

  const totalDealers = DEALERS.total;
  const byState = DEALERS.byState || [];
  const maxStateCount = Math.max(...byState.map((s) => s.value), 1);

  return (
    <>
      <section
        className="animate-fade-in-up"
        style={{ animationDelay: "80ms" }}
      >
        <div className="rounded-3xl bg-white border border-slate-200/70 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.06)] overflow-hidden">
          {/* ═══ Header ═══ */}
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm shadow-emerald-500/25">
                <Users size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight leading-none">
                  My Dealers
                </h2>
                <p className="text-[11px] text-slate-500 mt-1">
                  <span className="font-bold text-slate-700 tabular">
                    <CountUp end={totalDealers} duration={900} />
                  </span>{" "}
                  total dealers
                </p>
              </div>
            </div>
          </div>

          {/* ═══ Body ═══ */}
          <div className="p-4 sm:p-5 space-y-4">
            {/* ── 3 Status Tiles ── */}
            <div className="grid grid-cols-3 gap-3">
              {DEALERS.byStatus.map((s) => {
                const pct =
                  totalDealers > 0 ? (s.value / totalDealers) * 100 : 0;

                return (
                  <button
                    key={s.label}
                    onClick={() =>
                      setStatusModalFor({ label: s.label, value: s.value })
                    }
                    className="group relative text-left rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-md hover:shadow-slate-200/40 transition-all duration-300 overflow-hidden active:scale-[0.98] p-3.5"
                  >
                    <div
                      className="absolute top-0 left-0 bottom-0 w-[3px]"
                      style={{ backgroundColor: s.color }}
                    />
                    <div className="pl-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                          {s.label}
                        </span>
                        <ArrowUpRight
                          size={11}
                          className="text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                        />
                      </div>
                      <p
                        className="text-2xl font-black tabular tracking-tight leading-none"
                        style={{ color: s.color }}
                      >
                        <CountUp end={s.value} duration={800} />
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1 tabular">
                        {pct.toFixed(0)}% of total
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ═══════════════════════════════════════════════ */}
            {/* ── By State — 2-column grid ── */}
            {/* ═══════════════════════════════════════════════ */}
            <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                    <MapPin size={13} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-800 leading-none">
                      By State
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {byState.length} states · click to view dealers
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {byState.map((s, i) => {
                    const pct = (s.value / maxStateCount) * 100;
                    const color = STATE_COLORS[i % STATE_COLORS.length];

                    return (
                      <button
                        key={s.label}
                        onClick={() => setStateModalFor(s.label)}
                        className="group/state relative text-left rounded-xl border border-slate-200/70 bg-white hover:border-slate-300 hover:shadow-md hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden active:scale-[0.98] p-3"
                      >
                        {/* Left color accent */}
                        <div
                          className="absolute top-0 left-0 bottom-0 w-[3px] transition-all duration-300 group-hover/state:w-[4px]"
                          style={{ backgroundColor: color }}
                        />

                        <div className="pl-2">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-black text-slate-900 leading-none truncate group-hover/state:text-blue-700 transition-colors">
                                {s.label}
                              </p>
                              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">
                                dealers
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span
                                className="text-2xl font-black tabular leading-none"
                                style={{ color }}
                              >
                                <CountUp end={s.value} duration={700} />
                              </span>
                              <ArrowUpRight
                                size={13}
                                className="text-slate-300 group-hover/state:text-blue-600 group-hover/state:translate-x-0.5 group-hover/state:-translate-y-0.5 transition-all"
                              />
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-1000"
                              style={{
                                width: `${pct}%`,
                                background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                              }}
                            />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal 1: Dealer Status */}
      <DealerStatusModal
        status={statusModalFor}
        onClose={() => setStatusModalFor(null)}
      />

      {/* Direct Modal 2: Dealers by State */}
      <DealersListModal
        filter={
          stateModalFor
            ? {
                status: null,
                state: stateModalFor,
                title: `Dealers in ${stateModalFor}`,
              }
            : null
        }
        onClose={() => setStateModalFor(null)}
      />
    </>
  );
};

export default DealersSection;
