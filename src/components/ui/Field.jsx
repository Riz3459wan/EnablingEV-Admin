import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Field = ({ label, error, className = "", children }) => (
  <div className={className}>
    {label && (
      <label className="block text-sm font-medium mb-1.5 text-slate-700">
        {label}
      </label>
    )}
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const inputBase =
  "w-full bg-white border rounded-lg px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

export const Input = ({ error, className = "", ...rest }) => (
  <input
    className={`${inputBase} ${error ? "border-red-500" : "border-slate-300"} ${className}`}
    {...rest}
  />
);

export const PasswordInput = ({ error, className = "", ...rest }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        className={`${inputBase} pr-11 ${error ? "border-red-500" : "border-slate-300"} ${className}`}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
};

export const Select = ({ error, className = "", children, ...rest }) => (
  <select
    className={`${inputBase} ${error ? "border-red-500" : "border-slate-300"} ${className}`}
    {...rest}
  >
    {children}
  </select>
);

export const Textarea = ({ error, className = "", ...rest }) => (
  <textarea
    className={`${inputBase} resize-none ${error ? "border-red-500" : "border-slate-300"} ${className}`}
    {...rest}
  />
);

export default Field;
