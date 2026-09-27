// Generic read-only table. Wide tables scroll inside their own container so
// the page body never scrolls sideways.
const DataTable = ({
  columns,
  rows,
  rowKey,
  emptyText = "No records found.",
}) => (
  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm animate-fade-in">
    <table className="w-full text-sm text-left">
      <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200 sticky top-0 z-10">
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              className={`px-4 py-3 font-semibold whitespace-nowrap ${col.className || ""}`}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.length === 0 ? (
          <tr>
            <td
              colSpan={columns.length}
              className="px-4 py-10 text-center text-slate-500"
            >
              {emptyText}
            </td>
          </tr>
        ) : (
          rows.map((row, idx) => (
            <tr
              key={rowKey(row)}
              className="hover:bg-slate-50/80 transition-colors duration-150 animate-fade-in"
              style={{ animationDelay: `${idx * 20}ms` }}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-3 text-slate-800 align-top ${
                    col.wrap ? "min-w-[14rem]" : "whitespace-nowrap"
                  } ${col.className || ""}`}
                >
                  {col.render ? col.render(row) : (row[col.key] ?? "—")}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default DataTable;
