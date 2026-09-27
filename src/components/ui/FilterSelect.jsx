import { Filter } from "lucide-react";

const FilterSelect = ({
  label,
  value,
  onChange,
  options,
  className = "",
  showIcon = true,
}) => {
  const isActive = value !== "all" && value !== "";

  return (
    <div className={`relative ${className}`}>
      {showIcon && (
        <Filter
          size={14}
          className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
            isActive ? "text-blue-600" : "text-slate-400"
          }`}
        />
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className={`w-full appearance-none bg-white border rounded-lg py-2.5 pr-8 text-sm text-slate-800 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
          showIcon ? "pl-9" : "pl-3.5"
        } ${isActive ? "border-blue-300 bg-blue-50/40" : "border-slate-300"}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
        width="10"
        height="6"
        viewBox="0 0 10 6"
        fill="none"
      >
        <path
          d="M1 1L5 5L9 1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default FilterSelect;
