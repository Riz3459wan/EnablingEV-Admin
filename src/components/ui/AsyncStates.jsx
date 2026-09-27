import Card from "./Card";
import { SecondaryButton } from "./Button";

export const LoadingCard = ({ rows = 5 }) => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm animate-fade-in">
    <div className="h-10 bg-slate-100" />
    <div className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4">
          <div className="h-3 rounded-full animate-shimmer w-1/4" />
          <div className="h-3 rounded-full animate-shimmer w-1/6" />
          <div className="h-3 rounded-full animate-shimmer w-1/3" />
          <div className="h-3 rounded-full animate-shimmer w-1/5 ml-auto" />
        </div>
      ))}
    </div>
  </div>
);

export const ErrorCard = ({ message, onRetry }) => (
  <Card className="p-8 text-center animate-fade-in">
    <p className="text-red-500 text-sm mb-4">{message}</p>
    {onRetry && <SecondaryButton onClick={onRetry}>Retry</SecondaryButton>}
  </Card>
);

export const Banner = ({ type, children }) => (
  <div
    className={`mb-6 px-4 py-3 rounded-xl text-sm border animate-fade-in-down ${
      type === "success"
        ? "bg-green-50 border-green-200 text-green-700"
        : "bg-red-50 border-red-200 text-red-600"
    }`}
  >
    {children}
  </div>
);
