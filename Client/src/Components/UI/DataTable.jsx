import React from "react";

export default function DataTable({ columns, data, loading, emptyMessage = "No data available." }) {
  return (
    <div className="w-full bg-white dark:bg-[#1b1b1d] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse text-slate-900 dark:text-[#e8e3f0]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left text-[10px] font-bold tracking-[0.12em] text-slate-500 dark:text-[#9ca3af] uppercase py-4 px-4 first:pl-6"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Loading Skeleton State
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="border-b border-slate-100 dark:border-white/[0.04] animate-pulse">
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="py-4 px-4 first:pl-6">
                      <div className="h-4 bg-slate-200 dark:bg-white/[0.06] rounded-md w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty State
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-16 text-slate-400 dark:text-[#6b7280] text-sm"
                >
                  <p className="font-semibold">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              // Active Data Rows
              data.map((row, rIdx) => (
                <tr
                  key={row._id || row.id || rIdx}
                  className="border-b border-slate-100 dark:border-white/[0.04] hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors group"
                >
                  {columns.map((col) => {
                    const value = row[col.key];
                    const content = col.render ? col.render(value, row) : value;
                    return (
                      <td
                        key={col.key}
                        className="py-4 px-4 text-sm font-medium text-slate-800 dark:text-[#e8e3f0] group-hover:text-slate-900 dark:group-hover:text-white first:pl-6 transition-all"
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
