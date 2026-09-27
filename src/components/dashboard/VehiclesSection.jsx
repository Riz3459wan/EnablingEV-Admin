import { useState } from "react";
import { useNavigate } from "react-router";
import { Truck, Package, ArrowUpRight, Boxes } from "lucide-react";
import CountUp from "./shared/CountUp";
import AssemblyStatusModal from "./AssemblyStatusModal";

const VehiclesSection = ({ vehicles: VEHICLES }) => {
  const navigate = useNavigate();
  const [assemblyStatusFor, setAssemblyStatusFor] = useState(null);

  if (!VEHICLES) return null;

  return (
    <>
      <section className="animate-fade-in-up">
        <div className="rounded-3xl bg-white border border-slate-200/70 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.06)] overflow-hidden">
          {/* Header */}
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm shadow-blue-500/25">
                <Boxes size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight leading-none">
                  My Inventory
                </h2>
                <p className="text-[11px] text-slate-500 mt-1">
                  <span className="font-bold text-slate-700 tabular">
                    <CountUp end={VEHICLES.total} duration={900} />
                  </span>{" "}
                  total vehicles
                </p>
              </div>
            </div>

            {/* ✅ View All button */}
            <button
              onClick={() => navigate("/inventory")}
              className="group inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-white px-3.5 py-2 rounded-lg border border-slate-200 hover:border-slate-900 hover:bg-slate-900 transition-all"
            >
              View All
              <ArrowUpRight
                size={13}
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(VEHICLES.byType ?? []).map((t) => {
                const assembled = t.assembly?.assembled || 0;
                const unassembled = t.assembly?.unassembled || 0;
                const assembledPct =
                  t.value > 0 ? (assembled / t.value) * 100 : 0;
                const isRikshaw = t.key === "erikshaw";

                return (
                  <button
                    key={t.key}
                    onClick={() => setAssemblyStatusFor(t)}
                    className="group relative text-left rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden active:scale-[0.99]"
                  >
                    <div
                      className="h-[3px]"
                      style={{
                        background: `linear-gradient(90deg, ${t.color}, ${t.color}60, transparent)`,
                      }}
                    />

                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{
                              background: `linear-gradient(135deg, ${t.color}20, ${t.color}08)`,
                              color: t.color,
                              boxShadow: `inset 0 0 0 1px ${t.color}25`,
                            }}
                          >
                            {isRikshaw ? (
                              <Truck size={16} />
                            ) : (
                              <Package size={16} />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 leading-none">
                              {isRikshaw ? "E-Riksh" : "Cargo"}
                            </p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wider">
                              total
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className="text-2xl font-black tabular tracking-tight leading-none"
                            style={{ color: t.color }}
                          >
                            <CountUp end={t.value} duration={800} />
                          </span>
                          <ArrowUpRight
                            size={14}
                            className="text-slate-300 group-hover:text-slate-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: t.color }}
                          />
                          <span className="text-xs font-bold text-slate-700 tabular">
                            {assembled}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            assembled
                          </span>
                        </div>
                        <span className="w-px h-3 bg-slate-200" />
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                          <span className="text-xs font-bold text-slate-700 tabular">
                            {unassembled}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            unassembled
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                          <div
                            className="h-full transition-all duration-1000"
                            style={{
                              width: `${assembledPct}%`,
                              background: `linear-gradient(90deg, ${t.color}, ${t.color}cc)`,
                            }}
                          />
                          <div
                            className="h-full transition-all duration-1000"
                            style={{
                              width: `${100 - assembledPct}%`,
                              background:
                                "linear-gradient(90deg, #fbbf24, #f59e0b)",
                            }}
                          />
                        </div>
                        <span
                          className="text-[11px] font-black tabular shrink-0"
                          style={{ color: t.color }}
                        >
                          {assembledPct.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Modal 1 */}
      <AssemblyStatusModal
        vehicleType={assemblyStatusFor}
        onClose={() => setAssemblyStatusFor(null)}
      />
    </>
  );
};

export default VehiclesSection;
