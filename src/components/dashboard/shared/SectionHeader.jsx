import { ArrowRight } from "lucide-react";

const SectionHeader = ({
  icon: Icon,
  title,
  subtitle,
  count,
  gradient,
  onViewAll,
}) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-3">
      <div
        className={`relative w-10 h-10 rounded-xl ${gradient} flex items-center justify-center shadow-md`}
      >
        <div
          className={`absolute inset-0 rounded-xl ${gradient} blur-lg opacity-40 animate-pulse-slow`}
        />
        <Icon size={18} className="text-white relative z-10" />
      </div>
      <div>
        <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
          {title}
          {count !== undefined && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {count}
            </span>
          )}
        </h2>
        <p className="text-[11px] text-slate-500">{subtitle}</p>
      </div>
    </div>
    {onViewAll && (
      <button
        onClick={onViewAll}
        className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-800 transition-all active:scale-95"
      >
        View All
        <ArrowRight
          size={12}
          className="group-hover:translate-x-0.5 transition-transform"
        />
      </button>
    )}
  </div>
);

export default SectionHeader;
