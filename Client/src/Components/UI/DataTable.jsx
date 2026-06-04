import React from 'react';

/**
 * DataTable Component
 * ─────────────────────────────────────────────
 * A reusable, premium responsive table component matching the PEAK dark theme.
 * 
 * Props:
 *  - columns: Array of { key: string, label: string, render?: (val, row) => ReactNode }
 *  - data: Array of objects to render
 *  - loading: Boolean to show skeleton loader
 *  - emptyMessage: Custom message to display when no data is available
 */
export default function DataTable({ columns, data, loading, emptyMessage = "No data available." }) {
  return (
    <div className="w-full bg-[#1a1a24] border border-white/[0.06] rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse text-[#e8e3f0]">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left text-[10px] font-bold tracking-[0.12em] text-[#6b7280] uppercase py-4 px-4 first:pl-6"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Loading Skeleton State (Dark Theme)
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="border-b border-white/[0.04] animate-pulse">
                  {columns.map((col, cIdx) => (
                    <td
                      key={cIdx}
                      className="py-4 px-4 first:pl-6"
                    >
                      <div className="h-4 bg-white/[0.06] rounded-md w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty State
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-16 text-[#6b7280] text-sm"
                >
                  <p className="font-semibold">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              // Active Data Rows
              data.map((row, rIdx) => (
                <tr
                  key={row._id || row.id || rIdx}
                  className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors group"
                >
                  {columns.map((col) => {
                    const value = row[col.key];
                    const content = col.render ? col.render(value, row) : value;
                    return (
                      <td
                        key={col.key}
                        className="py-4 px-4 text-sm font-medium text-[#e8e3f0] group-hover:text-white first:pl-6 transition-all"
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
