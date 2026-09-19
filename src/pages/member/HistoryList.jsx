import { useEffect, useState } from 'react'
import { getMyReservasiHistory } from '../../api/reservasi.js'
import { unwrap, getErrorMessage } from '../../api/axios.js'
import Card from '../../components/ui/Card.jsx'
import Table from '../../components/ui/Table.jsx'
import Select from '../../components/ui/Select.jsx'
import Input from '../../components/ui/Input.jsx'
import StatusBadge from '../../components/ui/Badge.jsx'
import Loading from '../../components/common/Loading.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'
import { formatRupiah } from '../../utils/currency.js'
import { formatDateDisplay } from '../../utils/date.js'
import { normalizeReservasi } from '../../utils/reservasi.js'

export default function HistoryList() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Basic filtering for history (e.g. month, year)
  const [filters, setFilters] = useState({ month: '', year: '' })

  const load = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = {}
      if (filters.month) params.month = filters.month
      if (filters.year) params.year = filters.year

      const res = await getMyReservasiHistory(params)
      const body = unwrap(res)

      // Robust array extraction fix.
      console.log('HISTORY RESPONSE FULL:', JSON.stringify(body, null, 2))
      let raw = body?.data

      if (raw && !Array.isArray(raw)) {
        // Try known keys first
        if (Array.isArray(raw.data)) raw = raw.data
        else if (Array.isArray(raw.reservasi)) raw = raw.reservasi
        else if (Array.isArray(raw.history)) raw = raw.history
        else {
          // Generic fallback: find the first array value in the object
          const possibleArray = Object.values(raw).find(val => Array.isArray(val))
          raw = possibleArray || []
        }
      }

      let list = Array.isArray(raw) ? raw : []
      list = list.map(item => normalizeReservasi(item))

      setHistory(list)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filters])

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value })

  const columns = [
    {
      key: 'space',
      header: 'Space',
      render: (r) => <span className="font-medium text-ink">{r.nama_space || 'Space'}</span>
    },
    {
      key: 'tanggal',
      header: 'Tanggal & Waktu',
      render: (r) => (
        <div>
          <div className="font-medium">{formatDateDisplay(r.tanggal_reservasi)}</div>
          <div className="text-xs text-stone mt-0.5">{r.jam_mulai} {r.jam_selesai ? `- ${r.jam_selesai}` : ''}</div>
        </div>
      )
    },
    {
      key: 'durasi',
      header: 'Durasi',
      render: (r) => `${r.durasi_jam} Jam`
    },
    {
      key: 'total_bayar',
      header: 'Total Bayar',
      render: (r) => formatRupiah(r.total_bayar)
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge status={r.status} />
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="font-display text-3xl font-semibold text-ink mb-2">Histori Reservasi</h2>
        <p className="text-stone">Riwayat seluruh pemesanan ruang kerja Anda sebelumnya.</p>
      </div>

      <Card className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 border-stone/10">
        <Select
          name="month"
          value={filters.month}
          onChange={handleFilterChange}
          options={monthOptions}
          className="sm:w-48 bg-stone/5"
        />
        <Select
          name="year"
          value={filters.year}
          onChange={handleFilterChange}
          options={yearOptions}
          className="sm:w-48 bg-stone/5"
        />
      </Card>

      <Card className="border-stone/10 overflow-hidden">
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <Table columns={columns} data={history} emptyMessage="Tidak ada histori reservasi pada periode ini" />
        )}
      </Card>
    </div>
  )
}
