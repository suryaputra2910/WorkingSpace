import Button from '../ui/Button.jsx'

export default function ErrorState({ message = 'Terjadi kesalahan saat memuat data.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4 gap-4 animate-fade-in">
      <div className="w-12 h-12 rounded-full bg-brick/10 flex items-center justify-center">
        <svg className="w-6 h-6 text-brick" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <div>
        <h3 className="font-display text-lg text-ink mb-1">Gagal memuat data</h3>
        <p className="text-sm text-stone max-w-sm">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>Coba lagi</Button>
      )}
    </div>
  )
}
