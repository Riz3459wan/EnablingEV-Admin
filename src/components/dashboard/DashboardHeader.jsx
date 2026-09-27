const DashboardHeader = () => (
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-black text-slate-800 tracking-tight">
        Dashboard
      </h1>
      <p className="text-xs text-slate-500 mt-0.5">
        Click any card to explore details
      </p>
    </div>
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
        </span>
        <span className="text-[10px] font-bold text-emerald-600">LIVE</span>
      </div>
      <span className="text-[11px] text-slate-500 hidden sm:block">
        Apr 26, 2025 · 10:24 AM
      </span>
    </div>
  </div>
);

export default DashboardHeader;
