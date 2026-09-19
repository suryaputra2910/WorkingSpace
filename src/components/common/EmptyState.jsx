export default function EmptyState({ title = 'Belum ada data', description, action, icon }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4 gap-4 animate-fade-in border border-stone/10 border-dashed rounded-lg bg-white/50">
      <div className="w-16 h-16 rounded-full bg-sand/50 flex items-center justify-center text-stone">
        {icon || (
          <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        )}
      </div>
      <div>
        <h3 className="font-display text-lg text-ink font-medium mb-1">{title}</h3>
        {description && <p className="text-sm text-stone max-w-sm mx-auto">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
