export default function Table({ columns, data, keyField = 'id', emptyMessage = 'Belum ada data' }) {
  if (!data || data.length === 0) {
    return <div className="py-16 text-center text-stone text-sm">{emptyMessage}</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone/10">
            {columns.map((col) => (
              <th key={col.key} className="py-3.5 px-4 text-left font-medium text-xs uppercase tracking-wider text-stone/70 whitespace-nowrap">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone/5">
          {data.map((row) => (
            <tr key={row[keyField]} className="hover:bg-cream/50 transition-colors duration-150">
              {columns.map((col) => (
                <td key={col.key} className="py-3.5 px-4 align-middle text-ink/80">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
