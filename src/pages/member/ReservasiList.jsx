import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyReservasi } from '../../api/reservasi.js'
import { unwrap, getErrorMessage } from '../../api/axios.js'
import Card from '../../components/ui/Card.jsx'
import StatusBadge from '../../components/ui/Badge.jsx'
import Loading from '../../components/common/Loading.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import { formatDateDisplay } from '../../utils/date.js'

export default function ReservasiList() {
  const [reservasi, setReservasi] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getMyReservasi()
      const raw = unwrap(res).data
      setReservasi(Array.isArray(raw) ? raw : [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return <Loading />
  if (error) return <ErrorState message={error} onRetry={load} />

  // Filter out cancelled/completed items just in case the backend returns them here
  const activeList = reservasi.filter(r => !['dibatalkan', 'selesai'].includes(r.status))

  if (activeList.length === 0) {
    return (
      <EmptyState
        title="Belum ada reservasi aktif"
        description="Anda belum membuat reservasi, atau semua reservasi telah selesai/dibatalkan."
        action={<Link to="/member/spaces" className="inline-block px-5 py-2.5 bg-forest text-white rounded-md text-sm font-medium hover:bg-moss transition-colors">Pesan Space Sekarang</Link>}
      />
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="font-display text-3xl font-semibold text-ink mb-2">Reservasi Aktif</h2>
        <p className="text-stone">Pantau status reservasi dan jadwal Anda yang sedang berjalan.</p>
      </div>

      <div className="space-y-4">
        {activeList.map((r) => {
          const isCheckIn = r.status === 'disetujui' || r.status === 'aktif'
          return (
            <Link key={r.id} to={`/member/reservasi/${r.id}`} className="block group">
              <Card hover className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-stone/10 bg-white">
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={r.status} />
                    <span className="text-xs font-medium text-stone uppercase tracking-wider">{r.tipe?.replace('_', ' ')}</span>
                  </div>

                  <div>
                    <h3 className="font-display text-xl font-semibold text-ink group-hover:text-gray-600 transition-colors mb-1">
                      {r.detail_reservasi?.[0]?.space?.nama_space || r.space_nama || r.nama_space || 'Space'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-stone mt-2">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {formatDateDisplay(r.tanggal_reservasi)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {r.jam_mulai} {r.jam_selesai ? ` - ${r.jam_selesai}` : ''}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        {r.durasi_jam} Jam
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 border-t sm:border-t-0 sm:border-l border-stone/10 pt-4 sm:pt-0 sm:pl-6 shrink-0 min-w-[140px]">
                  {isCheckIn ? (
                    <div className="text-center sm:text-right w-full">
                      <span className="block text-xs text-stone mb-1">Status</span>
                      <span className="font-medium text-forest">Siap Digunakan</span>
                    </div>
                  ) : (
                    <div className="text-center sm:text-right w-full">
                      <span className="block text-xs text-stone mb-1">Status</span>
                      <span className="font-medium text-clay">Menunggu Konfirmasi</span>
                    </div>
                  )}
                  <span className="hidden sm:inline-block text-sm font-medium text-ink hover:text-forest transition-colors">
                    Lihat Detail →
                  </span>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
