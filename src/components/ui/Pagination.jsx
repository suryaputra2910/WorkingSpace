export default function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-3 pt-6">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="px-4 py-2 text-sm font-medium border border-stone/20 rounded-md disabled:opacity-30 hover:bg-sand/60 transition-colors duration-200"
      >
        Sebelumnya
      </button>
      <span className="text-sm text-stone tabular-nums">
        {page} / {totalPages}
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="px-4 py-2 text-sm font-medium border border-stone/20 rounded-md disabled:opacity-30 hover:bg-sand/60 transition-colors duration-200"
      >
        Selanjutnya
      </button>
    </div>
  )
}
