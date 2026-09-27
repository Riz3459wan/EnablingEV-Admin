import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Truck,
  Package,
  ArrowUpRight,
  CheckCircle2,
  Wrench,
  TrendingUp,
  Activity,
  Zap,
} from "lucide-react";
import CountUp from "./shared/CountUp";

// ─── Mock data (aapke actual data jaisa) ───
const MOCK = {
  total: 892,
  byType: [
    {
      key: "erikshaw",
      label: "E-Rickshaw",
      value: 625,
      color: "#3b82f6",
      assembly: { assembled: 505, unassembled: 120 },
    },
    {
      key: "cargo",
      label: "E-Cargo",
      value: 267,
      color: "#10b981",
      assembly: { assembled: 207, unassembled: 60 },
    },
  ],
};

const TABS = [
  { key: "glass", label: "1. Glass Gradient", color: "#3b82f6" },
  { key: "bento", label: "2. Bento Grid", color: "#8b5cf6" },
  { key: "dark", label: "3. Dark Neon", color: "#06b6d4" },
];

// ═══════════════════════════════════════════════════════════
//  DESIGN 1: GLASS + GRADIENT HERO
// ═══════════════════════════════════════════════════════════
const GlassGradientDesign = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {MOCK.byType.map((t, i) => {
        const assembled = t.assembly.assembled;
        const unassembled = t.assembly.unassembled;
        const pct = (assembled / t.value) * 100;

        return (
          <div
            key={t.key}
            className="group relative overflow-hidden rounded-3xl p-6 text-white shadow-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl cursor-pointer"
            onClick={() => navigate(`/inventory?type=${t.key}`)}
            style={{
              background:
                t.key === "erikshaw"
                  ? "linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)"
                  : "linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%)",
            }}
          >
            {/* Decorative circles */}
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/10 blur-3xl group-hover:bg-white/20 transition-all duration-500" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-white/5 blur-2xl" />

            {/* Grid pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center">
                    {t.key === "erikshaw" ? (
                      <Truck size={22} />
                    ) : (
                      <Package size={22} />
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">
                      {t.label}
                    </p>
                    <p className="text-[11px] opacity-60 mt-0.5">
                      total vehicles
                    </p>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-white/25 group-hover:scale-110 transition-all">
                  <ArrowUpRight size={16} />
                </div>
              </div>

              {/* Big number */}
              <div className="mb-6">
                <p className="text-[60px] font-black leading-none tabular tracking-tighter">
                  <CountUp end={t.value} duration={800} />
                </p>
              </div>

              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                    Assembly Progress
                  </span>
                  <span className="text-lg font-black tabular">
                    {pct.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] transition-all duration-1000"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Stats glass cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/15 backdrop-blur-xl border border-white/20 p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CheckCircle2 size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                      Assembled
                    </span>
                  </div>
                  <p className="text-2xl font-black tabular leading-none">
                    {assembled}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/15 backdrop-blur-xl border border-white/20 p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Wrench size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                      Pending
                    </span>
                  </div>
                  <p className="text-2xl font-black tabular leading-none">
                    {unassembled}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
//  DESIGN 2: BENTO GRID
// ═══════════════════════════════════════════════════════════
const BentoGridDesign = () => {
  const navigate = useNavigate();
  const totalAssembled = MOCK.byType.reduce(
    (s, t) => s + t.assembly.assembled,
    0,
  );
  const totalUnassembled = MOCK.byType.reduce(
    (s, t) => s + t.assembly.unassembled,
    0,
  );
  const overallPct = (totalAssembled / MOCK.total) * 100;

  return (
    <div className="space-y-4">
      {/* Top row: Total + Live */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Big Total tile */}
        <div className="md:col-span-2 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                Total Fleet
              </span>
            </div>
            <p className="text-[72px] font-black leading-none tabular tracking-tighter mb-2">
              <CountUp end={MOCK.total} duration={1000} />
            </p>
            <p className="text-sm text-slate-400">
              Across {MOCK.byType.length} vehicle categories
            </p>

            <div className="mt-6 flex items-center gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                  Assembled
                </p>
                <p className="text-2xl font-black text-emerald-400 tabular">
                  {totalAssembled}
                </p>
              </div>
              <div className="w-px h-10 bg-slate-700" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                  Pending
                </p>
                <p className="text-2xl font-black text-amber-400 tabular">
                  {totalUnassembled}
                </p>
              </div>
              <div className="w-px h-10 bg-slate-700" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                  Progress
                </p>
                <p className="text-2xl font-black text-white tabular">
                  {overallPct.toFixed(0)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Live tile */}
        <div className="rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-emerald-50 border border-emerald-100 p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/40 rounded-full blur-2xl" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <Activity size={18} className="text-emerald-600" />
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-100 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">
                  Live
                </span>
              </div>
            </div>

            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1">
              Today
            </p>
            <p className="text-4xl font-black text-slate-900 tabular leading-none mb-1">
              <CountUp end={45} />
            </p>
            <p className="text-xs text-slate-500">vehicles added</p>

            <div className="mt-6 pt-4 border-t border-emerald-100">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <TrendingUp size={12} className="text-emerald-600" />
                <span className="font-bold text-emerald-700">+12%</span>
                <span className="text-slate-400">vs last week</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Type tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK.byType.map((t) => {
          const pct = (t.assembly.assembled / t.value) * 100;
          return (
            <div
              key={t.key}
              onClick={() => navigate(`/inventory?type=${t.key}`)}
              className="group cursor-pointer rounded-3xl bg-white border border-slate-200/80 p-5 hover:border-transparent hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
            >
              <div
                className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-[0.08] group-hover:opacity-[0.15] transition-opacity"
                style={{ backgroundColor: t.color }}
              />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md"
                      style={{
                        background: `linear-gradient(135deg, ${t.color}, ${t.color}cc)`,
                        boxShadow: `0 8px 20px -6px ${t.color}80`,
                      }}
                    >
                      {t.key === "erikshaw" ? (
                        <Truck size={18} />
                      ) : (
                        <Package size={18} />
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {t.label}
                      </p>
                      <p className="text-3xl font-black text-slate-900 tabular leading-none mt-1">
                        <CountUp end={t.value} />
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight
                    size={18}
                    className="text-slate-300 group-hover:text-slate-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                  />
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${t.color}, ${t.color}cc)`,
                      }}
                    />
                  </div>
                  <span
                    className="text-sm font-black tabular"
                    style={{ color: t.color }}
                  >
                    {pct.toFixed(0)}%
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-slate-800 tabular">
                      {t.assembly.assembled}
                    </span>
                    assembled
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="font-bold text-slate-800 tabular">
                      {t.assembly.unassembled}
                    </span>
                    pending
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alert bar */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-50 via-white to-amber-50 border border-amber-200 p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
          <Zap size={18} className="text-amber-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-800">
            {totalUnassembled} vehicles pending assembly
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Click to view unassembled stock in inventory
          </p>
        </div>
        <button
          onClick={() => navigate("/inventory?assembly=unassembled")}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
        >
          View Pending
          <ArrowUpRight size={12} />
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
//  DESIGN 3: DARK NEON
// ═══════════════════════════════════════════════════════════
const DarkNeonDesign = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0a0e1a] rounded-3xl p-6 relative overflow-hidden">
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(6,182,212,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.6) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Ambient glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-500/10 blur-[100px]" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-[100px]" />

      <div className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {MOCK.byType.map((t, i) => {
            const assembled = t.assembly.assembled;
            const unassembled = t.assembly.unassembled;
            const pct = (assembled / t.value) * 100;
            const neonColor = t.key === "erikshaw" ? "#06b6d4" : "#10b981";

            return (
              <div
                key={t.key}
                onClick={() => navigate(`/inventory?type=${t.key}`)}
                className="group cursor-pointer relative rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-slate-600 p-5 transition-all duration-300 hover:shadow-[0_0_40px_rgba(6,182,212,0.15)]"
              >
                {/* Neon top accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-[1px] transition-all duration-500"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${neonColor}, transparent)`,
                    boxShadow: `0 0 20px ${neonColor}`,
                  }}
                />

                {/* Corner brackets */}
                <div
                  className="absolute top-2 left-2 w-3 h-3 border-t border-l"
                  style={{ borderColor: `${neonColor}60` }}
                />
                <div
                  className="absolute top-2 right-2 w-3 h-3 border-t border-r"
                  style={{ borderColor: `${neonColor}60` }}
                />
                <div
                  className="absolute bottom-2 left-2 w-3 h-3 border-b border-l"
                  style={{ borderColor: `${neonColor}60` }}
                />
                <div
                  className="absolute bottom-2 right-2 w-3 h-3 border-b border-r"
                  style={{ borderColor: `${neonColor}60` }}
                />

                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{
                          background: `${neonColor}15`,
                          border: `1px solid ${neonColor}40`,
                          boxShadow: `0 0 12px ${neonColor}30`,
                        }}
                      >
                        {t.key === "erikshaw" ? (
                          <Truck size={16} style={{ color: neonColor }} />
                        ) : (
                          <Package size={16} style={{ color: neonColor }} />
                        )}
                      </div>
                      <div>
                        <p
                          className="text-[10px] font-bold uppercase tracking-[0.2em] font-mono"
                          style={{ color: neonColor }}
                        >
                          {t.label}
                        </p>
                        <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                          // total units
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight
                      size={16}
                      className="text-slate-600 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                    />
                  </div>

                  {/* Big number */}
                  <div className="mb-5">
                    <p
                      className="text-[54px] font-black leading-none tabular tracking-tight font-mono"
                      style={{
                        color: neonColor,
                        textShadow: `0 0 30px ${neonColor}80`,
                      }}
                    >
                      <CountUp end={t.value} duration={800} />
                    </p>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                        Progress
                      </span>
                      <span
                        className="text-sm font-black tabular font-mono"
                        style={{
                          color: neonColor,
                          textShadow: `0 0 8px ${neonColor}80`,
                        }}
                      >
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                    <div className="relative h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${neonColor}80, ${neonColor})`,
                          boxShadow: `0 0 12px ${neonColor}`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-1 font-mono">
                        Assembled
                      </p>
                      <p className="text-xl font-black tabular text-emerald-400 font-mono">
                        {assembled}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-1 font-mono">
                        Pending
                      </p>
                      <p className="text-xl font-black tabular text-amber-400 font-mono">
                        {unassembled}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
//  MAIN DEMO COMPONENT
// ═══════════════════════════════════════════════════════════
const DesignDemos = () => {
  const [activeTab, setActiveTab] = useState("glass");

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.key
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Render active design */}
      {activeTab === "glass" && <GlassGradientDesign />}
      {activeTab === "bento" && <BentoGridDesign />}
      {activeTab === "dark" && <DarkNeonDesign />}
    </div>
  );
};

export default DesignDemos;
