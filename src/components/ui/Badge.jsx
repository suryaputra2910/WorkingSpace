const STATUS_STYLES = {
  belum_dikonfirm: { label: 'Menunggu', className: 'bg-clay/10 text-clay border-clay/20' },
  disetujui: { label: 'Disetujui', className: 'bg-moss/10 text-forest border-moss/20' },
  aktif: { label: 'Aktif', className: 'bg-forest/10 text-forest border-forest/20' },
  selesai: { label: 'Selesai', className: 'bg-stone/10 text-stone border-stone/20' },
  dibatalkan: { label: 'Dibatalkan', className: 'bg-brick/10 text-brick border-brick/20' },
}

export default function StatusBadge({ status }) {
  const config = STATUS_STYLES[status] ?? { label: status, className: 'bg-sand text-stone border-stone/20' }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  )
}
