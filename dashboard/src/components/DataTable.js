export default function DataTable({ title, columns, data, loading, emptyMsg = "No data found", action }) {
  return (
    <div className="glass-card overflow-hidden animate-slide-up">
      {title && (
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h3>
          {action}
        </div>
      )}

      {loading ? (
        <div className="p-6 space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-10 shimmer" />)}
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16" style={{ color: "var(--text-muted)" }}>
          <div className="text-4xl mb-3 opacity-40">📭</div>
          <p className="text-sm">{emptyMsg}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {columns.map((col) => (
                  <th key={col.key} className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: "var(--text-muted)" }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="table-row-hover transition-colors duration-150"
                  style={{ borderBottom: i < data.length - 1 ? "1px solid var(--border)" : "none" }}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-3.5 whitespace-nowrap" style={{ color: "var(--text-primary)" }}>
                      {col.render ? col.render(row[col.key], row) : row[col.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
