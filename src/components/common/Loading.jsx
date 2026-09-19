export default function Loading({ label = 'Memuat data...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
      <div className="relative">
        <span className="block h-8 w-8 border-2 border-sand rounded-full" />
        <span className="absolute inset-0 h-8 w-8 border-2 border-moss border-t-transparent rounded-full animate-spin" />
      </div>
      <span className="text-sm text-stone">{label}</span>
    </div>
  )
}
