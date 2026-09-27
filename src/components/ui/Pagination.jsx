import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const buildPageNumbers = (current, total) => {
  const pages = [];
  const maxVisible = 5;

  if (total <= maxVisible + 2) {
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }

  pages.push(1);

  let start = Math.max(2, current - 1);
  let end = Math.min(total - 1, current + 1);

  if (current <= 3) {
    end = Math.min(total - 1, maxVisible - 1);
  }
  if (current >= total - 2) {
    start = Math.max(2, total - maxVisible + 2);
  }

  if (start > 2) pages.push("start-ellipsis");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("end-ellipsis");

  pages.push(total);

  return pages;
};

const Pagination = ({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const pages = buildPageNumbers(page, totalPages);

  const go = (p) => {
    const next = Math.min(Math.max(1, p), totalPages);
    if (next !== page) onPageChange(next);
  };

  if (total === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 px-1">
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span>
          Showing <strong className="text-slate-700">{start}</strong>–
          <strong className="text-slate-700">{end}</strong> of{" "}
          <strong className="text-slate-700">{total}</strong>
        </span>
        <span className="hidden sm:inline-flex items-center gap-1.5">
          <span className="text-slate-400">·</span>
          <span>Rows per page</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-white border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            aria-label="Rows per page"
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => go(1)}
          disabled={page === 1}
          className="w-8 h-8 rounded-md flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="First page"
        >
          <ChevronsLeft size={14} />
        </button>
        <button
          onClick={() => go(page - 1)}
          disabled={page === 1}
          className="w-8 h-8 rounded-md flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
        </button>

        {pages.map((p, idx) => {
          if (typeof p === "string") {
            return (
              <span
                key={`${p}-${idx}`}
                className="w-8 h-8 flex items-center justify-center text-xs text-slate-400"
              >
                …
              </span>
            );
          }
          const isActive = p === page;
          return (
            <button
              key={p}
              onClick={() => go(p)}
              className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-semibold transition-colors ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
              aria-label={`Page ${p}`}
              aria-current={isActive ? "page" : undefined}
            >
              {p}
            </button>
          );
        })}

        <button
          onClick={() => go(page + 1)}
          disabled={page === totalPages}
          className="w-8 h-8 rounded-md flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight size={14} />
        </button>
        <button
          onClick={() => go(totalPages)}
          disabled={page === totalPages}
          className="w-8 h-8 rounded-md flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Last page"
        >
          <ChevronsRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
