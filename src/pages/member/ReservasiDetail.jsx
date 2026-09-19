import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getReservasiById, cancelReservasi } from '../../api/reservasi.js'
import { unwrap, getErrorMessage } from '../../api/axios.js'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import StatusBadge from '../../components/ui/Badge.jsx'
import Loading from '../../components/common/Loading.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'
import ConfirmDialog from '../../components/modal/ConfirmDialog.jsx'
import { formatRupiah } from '../../utils/currency.js'
import { formatDateDisplay } from '../../utils/date.js'
import { normalizeReservasi } from '../../utils/reservasi.js'

export default function ReservasiDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [reservasi, setReservasi] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCancel, setShowCancel] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getReservasiById(id)
      const raw = unwrap(res).data
      setReservasi(normalizeReservasi(raw))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const handleCancel = async () => {
    setIsCancelling(true)
    try {
      await cancelReservasi(id)
      toast.success('Reservasi berhasil dibatalkan')
      navigate('/member/reservasi')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsCancelling(false)
    }
  }

  if (loading) return <Loading />
  if (error) return <ErrorState message={error} onRetry={load} />
  if (!reservasi) return null

  const r = reservasi
  const canCancel = ['belum_dikonfirm', 'disetujui'].includes(r.status)

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-stone/10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-stone/10 text-stone transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <h2 className="font-display text-2xl font-semibold text-ink">Detail Reservasi</h2>
        </div>
        <StatusBadge status={r.status} />
      </div>

      <Card className="p-0 overflow-hidden border-stone/10">
        <div className="bg-sand/30 p-6 sm:p-8 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-stone uppercase tracking-wider mb-2">Space Terpilih</p>
            <h3 className="font-display text-2xl font-bold text-ink">{r.nama_space || 'Nama Space'}</h3>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <p className="text-sm font-medium text-stone mb-1">Tanggal</p>
              <p className="text-ink font-medium">{formatDateDisplay(r.tanggal_reservasi)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-stone mb-1">Mulai</p>
              <p className="text-ink font-medium">{r.jam_mulai}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-stone mb-1">Selesai</p>
              <p className="text-ink font-medium">{r.jam_selesai || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-stone mb-1">Durasi</p>
              <p className="text-ink font-medium">{r.durasi_jam} Jam</p>
            </div>
          </div>

          <div className="border-t border-stone/10 pt-6">
            <h4 className="font-semibold text-ink mb-4">Rincian Pembayaran</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center text-stone">
                <span>Harga per jam</span>
                <span>{formatRupiah(r.harga_per_jam)}</span>
              </div>
              <div className="flex justify-between items-center text-stone">
                <span>Subtotal ({r.durasi_jam} jam)</span>
                <span>{formatRupiah(r.total_harga_awal)}</span>
              </div>
              {r.potongan_diskon > 0 && (
                <div className="flex justify-between items-center text-forest">
                  <span>Diskon</span>
                  <span>-{formatRupiah(r.potongan_diskon)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-4 mt-2 border-t border-stone/10 font-medium text-base text-ink">
                <span>Total Bayar</span>
                <span>{formatRupiah(r.total_bayar)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-stone/5 p-6 sm:p-8 flex flex-col sm:flex-row gap-3">
          <Link to={`/member/e-ticket/${r.id}`} className="flex-1">
            <Button variant="primary" className="w-full">Unduh E-Ticket</Button>
          </Link>
          {canCancel && (
            <Button variant="outline" className="flex-1 text-brick hover:bg-brick/5 hover:border-brick/30" onClick={() => setShowCancel(true)}>
              Batalkan Reservasi
            </Button>
          )}
        </div>
      </Card>

      <ConfirmDialog
        open={showCancel}
        onClose={() => setShowCancel(false)}
        onConfirm={handleCancel}
        isLoading={isCancelling}
        danger
        title="Batalkan Reservasi"
        description="Apakah Anda yakin ingin membatalkan reservasi ini? Tindakan ini tidak dapat diurungkan."
        confirmLabel="Ya, Batalkan"
      />
    </div>
  )
}
