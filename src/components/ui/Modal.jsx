import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const Modal = ({
  open,
  onClose,
  title,
  subtitle,
  maxWidth = "max-w-md",
  children,
  // ✅ Navigation support
  onBack,
  onForward,
  canGoBack,
  canGoForward,
  breadcrumb,
}) => {
  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowLeft" && canGoBack) onBack?.();
      if (e.key === "ArrowRight" && canGoForward) onForward?.();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose, onBack, onForward, canGoBack, canGoForward]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${maxWidth} bg-white rounded-3xl shadow-2xl shadow-slate-900/30 max-h-[90vh] overflow-hidden flex flex-col animate-scale-in ring-1 ring-slate-200`}
      >
        {/* Top gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        {/* Header */}
        <div className="relative flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-slate-100 bg-gradient-to-br from-slate-50/80 to-white shrink-0">
          {/* Navigation buttons (left) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {onBack && (
              <button
                onClick={onBack}
                disabled={!canGoBack}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  canGoBack
                    ? "bg-white border border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 active:scale-90"
                    : "bg-slate-100 text-slate-300 cursor-not-allowed"
                }`}
                aria-label="Go back"
                title="Back (←)"
              >
                <ChevronLeft size={16} />
              </button>
            )}
            {onForward && (
              <button
                onClick={onForward}
                disabled={!canGoForward}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  canGoForward
                    ? "bg-white border border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 active:scale-90"
                    : "bg-slate-100 text-slate-300 cursor-not-allowed"
                }`}
                aria-label="Go forward"
                title="Forward (→)"
              >
                <ChevronRight size={16} />
              </button>
            )}
          </div>

          {/* Title */}
          <div className="flex-1 min-w-0">
            {breadcrumb && breadcrumb.length > 0 && (
              <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 truncate">
                {breadcrumb.map((b, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && (
                      <ChevronRight size={10} className="text-slate-300" />
                    )}
                    <span
                      className={
                        i === breadcrumb.length - 1 ? "text-blue-600" : ""
                      }
                    >
                      {b}
                    </span>
                  </span>
                ))}
              </div>
            )}
            <h2 className="text-base font-black text-slate-800 tracking-tight truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>

          {/* Close button (right) */}
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all active:scale-90"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div
          className="p-5 overflow-y-auto bg-white"
          style={{ minHeight: "100px" }}
        >
          {children || (
            <p className="text-center text-slate-400 text-sm py-6">
              No content available
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
