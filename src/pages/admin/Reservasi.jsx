import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getAdminReservasi as getReservasi, updateReservasiStatus as updateStatusReservasi } from '../../api/reservasi.js'
import { unwrap, getErrorMessage } from '../../api/axios.js'
import Table from '../../components/ui/Table.jsx'
import Select from '../../components/ui/Select.jsx'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import StatusBadge from '../../components/ui/Badge.jsx'
import Loading from '../../components/common/Loading.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'
import { formatRupiah } from '../../utils/currency.js'
import { formatDateDisplay } from '../../utils/date.js'
import { normalizeReservasi } from '../../utils/reservasi.js'

export default function Reservasi() {
  const [reservasi, setReservasi] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [filters, setFilters] = useState({ month: '', year: '', status: '' })
  const [updating, setUpdating] = useState(null) // ID yang sedang diupdate

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (filters.month) params.month = filters.month
      if (filters.year) params.year = filters.year
      if (filters.status) params.status = filters.status

      const res = await getReservasi(params)
      let raw = unwrap(res).data

      if (raw && !Array.isArray(raw)) {
        if (Array.isArray(raw.data)) raw = raw.data
        else if (Array.isArray(raw.reservasi)) raw = raw.reservasi
        else {
          const arr = Object.values(raw).find(v => Array.isArray(v))
          raw = arr || []
        }
      }

      const list = Array.isArray(raw) ? raw : []
      setReservasi(list.map(normalizeReservasi))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filters])

  const handleUpdateStatus = async (id, status) => {
    setUpdating(id)
    try {
      await updateStatusReservasi(id, status)
      toast.success('Status berhasil diperbarui')
      load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setUpdating(null)
    }
  }

  if (loading) return <Loading />
  if (error) return <ErrorState message={error} onRetry={load} />

  const columns = [
    {
      key: 'info',
      header: 'Member & Space',
      render: (r) => (
        <div>
          <div className="font-medium text-ink">{r.member?.nama_member || 'Member'}</div>
          <div className="text-xs text-stone mt-0.5">{r.nama_space || 'Space'}</div>
        </div>
      )
    },
    {
      key: 'waktu',
      header: 'Waktu Reservasi',
      render: (r) => (
        <div>
          <div className="font-medium">{formatDateDisplay(r.tanggal_reservasi)}</div>
          <div className="text-xs text-stone mt-0.5">{r.jam_mulai} ({r.durasi_jam} Jam)</div>
        </div>
      )
    },
    {
      key: 'bayar',
      header: 'Pembayaran',
      render: (r) => <span className="font-medium">{formatRupiah(r.total_bayar)}</span>
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge status={r.status} />
    },
    {
      key: 'aksi',
      header: 'Aksi Status',
      render: (r) => (
        <div className="flex items-center gap-2">
          <select
            className="border border-stone/20 rounded-md text-xs px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-forest cursor-pointer bg-white"
            value={r.status}
            onChange={(e) => handleUpdateStatus(r.id, e.target.value)}
            disabled={updating === r.id}
          >
            <option value="belum_dikonfirm">Menunggu</option>
            <option value="disetujui">Disetujui</option>
            <option value="aktif">Aktif</option>
            <option value="selesai">Selesai</option>
            <option value="dibatalkan">Dibatalkan</option>
          </select>
          {updating === r.id && <span className="w-4 h-4 border-2 border-forest border-t-transparent rounded-full animate-spin" />}
        </div>
      )
    },
  ]

  const currentYear = new Date().getFullYear()
  const yearOptions = [
    { value: '', label: 'Semua Tahun' },
    { value: currentYear.toString(), label: currentYear.toString() },
    { value: (currentYear - 1).toString(), label: (currentYear - 1).toString() }
  ]

  const monthOptions = [
    { value: '', label: 'Semua Bulan' },
    { value: '1', label: 'Januari' }, { value: '2', label: 'Februari' }, { value: '3', label: 'Maret' },
    { value: '4', label: 'April' }, { value: '5', label: 'Mei' }, { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' }, { value: '8', label: 'Agustus' }, { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' }, { value: '11', label: 'November' }, { value: '12', label: 'Desember' }
  ]

  const statusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'belum_dikonfirm', label: 'Menunggu' },
    { value: 'disetujui', label: 'Disetujui' },
    { value: 'aktif', label: 'Aktif' },
    { value: 'selesai', label: 'Selesai' },
    { value: 'dibatalkan', label: 'Dibatalkan' }
  ]

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value })

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="font-display text-3xl font-semibold text-ink mb-1">Kelola Reservasi</h2>
        <p className="text-stone">Pantau dan kelola seluruh reservasi member (tanpa kode booking).</p>
      </div>

      <Card className="p-4 sm:p-5 flex flex-col sm:flex-row flex-wrap gap-4 border-stone/10 bg-white">
        <Select name="month" value={filters.month} onChange={handleChange} options={monthOptions} className="sm:w-40 bg-stone/5" />
        <Select name="year" value={filters.year} onChange={handleChange} options={yearOptions} className="sm:w-40 bg-stone/5" />
        <Select name="status" value={filters.status} onChange={handleChange} options={statusOptions} className="sm:w-40 bg-stone/5" />
      </Card>

      <Card className="p-0 border-stone/10">
        <Table columns={columns} data={reservasi} emptyMessage="Tidak ada reservasi ditemukan." />
      </Card>
    </div>
  )
}
