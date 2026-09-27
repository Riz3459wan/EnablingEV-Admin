export const PrimaryButton = ({ children, className = "", ...rest }) => (
  <button
    className={`bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-blue-500/20 active:scale-[0.97] btn-ripple flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 ${className}`}
    {...rest}
  >
    {children}
  </button>
);

export const SecondaryButton = ({ children, className = "", ...rest }) => (
  <button
    className={`bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-2 disabled:opacity-60 ${className}`}
    {...rest}
  >
    {children}
  </button>
);

export const EmberButton = ({ children, className = "", ...rest }) => (
  <button
    className={`bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-orange-500/20 active:scale-[0.97] btn-ripple flex items-center justify-center gap-2 ${className}`}
    {...rest}
  >
    {children}
  </button>
);
