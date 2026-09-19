import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getReservasiById } from '../../api/reservasi.js'
import { unwrap, getErrorMessage } from '../../api/axios.js'
import Button from '../../components/ui/Button.jsx'
import Loading from '../../components/common/Loading.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'
import { formatRupiah } from '../../utils/currency.js'
import { formatDateDisplay } from '../../utils/date.js'

export default function ETicket() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const printRef = useRef(null)

  const load = async () => {
    try {
      const res = await getReservasiById(id)
      const raw = unwrap(res).data
      // handle nested 'reservasi' if present
      setData(raw?.reservasi || raw)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  if (loading) return <Loading />
  if (error) return <ErrorState message={error} onRetry={load} />
  if (!data) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between mb-8 print:hidden">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-stone/10 text-stone transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <Button onClick={() => window.print()} variant="primary">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Cetak Tiket
        </Button>
      </div>

      {/* Ticket Container */}
      <div
        ref={printRef}
        className="bg-white rounded-2xl shadow-elevated overflow-hidden border border-stone/10 relative print:shadow-none print:border-none"
      >
        {/* Ticket Top: Brand & Title */}
        <div className="bg-ink text-paper p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-forest/20 mix-blend-overlay" />
          <div className="relative z-10">
            <span className="font-display text-xl font-semibold tracking-tight text-sand block mb-2">Ruang Kerja.</span>
            <h1 className="text-sm font-medium tracking-widest uppercase opacity-80">E-Ticket Reservasi</h1>
          </div>
        </div>

        {/* Ticket Cutouts */}
        <div className="relative flex justify-between items-center -my-4 z-10">
          <div className="w-8 h-8 rounded-full bg-paper border-r border-stone/10 -ml-4" />
          <div className="flex-1 border-t-2 border-dashed border-stone/20 mx-4" />
          <div className="w-8 h-8 rounded-full bg-paper border-l border-stone/10 -mr-4" />
        </div>

        {/* Ticket Body: Details */}
        <div className="p-8 space-y-8 bg-white">
          <div className="text-center pb-8 border-b border-stone/10">
            <h2 className="font-display text-3xl font-bold text-ink">{data.detail_reservasi?.[0]?.space?.nama_space || data.space_nama || data.nama_space || 'Space'}</h2>
            <p className="text-sm text-stone mt-2">Nomor Reservasi: <span className="font-mono text-ink font-medium">#{data.id}</span></p>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:gap-8 max-w-sm mx-auto">
            <div>
              <span className="block text-xs font-medium text-stone uppercase tracking-wider mb-1">Tanggal</span>
              <span className="font-medium text-ink">{formatDateDisplay(data.tanggal_reservasi)}</span>
            </div>
            <div>
              <span className="block text-xs font-medium text-stone uppercase tracking-wider mb-1">Durasi</span>
              <span className="font-medium text-ink">{data.durasi_jam} Jam</span>
            </div>
            <div>
              <span className="block text-xs font-medium text-stone uppercase tracking-wider mb-1">Check In</span>
              <span className="font-medium text-ink">{data.jam_mulai}</span>
            </div>
            <div>
              <span className="block text-xs font-medium text-stone uppercase tracking-wider mb-1">Check Out</span>
              <span className="font-medium text-ink">{data.jam_selesai || '-'}</span>
            </div>
          </div>

          {/* User & Status */}
          <div className="bg-sand/30 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <div>
              <span className="block text-xs font-medium text-stone uppercase tracking-wider mb-1">Dipesan Oleh</span>
              <span className="font-medium text-ink">{data.member?.nama_member || 'Member'}</span>
            </div>
            <div>
              <span className="block text-xs font-medium text-stone uppercase tracking-wider mb-1">Status Reservasi</span>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${data.status === 'disetujui' || data.status === 'aktif' ? 'bg-forest/10 text-forest' :
                  data.status === 'selesai' ? 'bg-stone/10 text-stone' : 'bg-clay/10 text-clay'
                }`}>
                {data.status}
              </span>
            </div>
          </div>
        </div>

        {/* Ticket Bottom: QR/Barcode Area (Mock) */}
        <div className="bg-cream/30 p-8 border-t border-stone/10 text-center">
          <div className="h-16 w-3/4 max-w-[240px] mx-auto bg-stone/20 rounded-sm mb-3 flex items-center justify-center relative overflow-hidden">
            {/* Mock barcode lines */}
            <div className="absolute inset-y-0 w-full flex justify-between px-2 opacity-50">
              {[...Array(30)].map((_, i) => (
                <div key={i} className={`h-full bg-ink ${i % 3 === 0 ? 'w-1' : i % 2 === 0 ? 'w-0.5' : 'w-1.5'}`} />
              ))}
            </div>
          </div>
          <p className="text-xs text-stone font-mono tracking-widest">{data.id}-{data.tanggal_reservasi?.replace(/-/g, '')}</p>
          <p className="text-[10px] text-stone mt-4 max-w-xs mx-auto">Tunjukkan e-ticket ini kepada resepsionis atau scan di kiosk saat kedatangan.</p>
        </div>
      </div>
    </div>
  )
}
