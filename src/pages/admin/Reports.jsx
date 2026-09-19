import { useEffect, useState } from 'react'
import { getMonthlyReport as getReports } from '../../api/reports.js'
import { unwrap, getErrorMessage } from '../../api/axios.js'
import Card from '../../components/ui/Card.jsx'
import Select from '../../components/ui/Select.jsx'
import Loading from '../../components/common/Loading.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'
import { formatRupiah } from '../../utils/currency.js'

export default function Reports() {
  const currentYear = new Date().getFullYear()
  const currentMonth = (new Date().getMonth() + 1).toString()

  const [filters, setFilters] = useState({ month: currentMonth, year: currentYear.toString() })
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getReports({ month: filters.month, year: filters.year })
      const data = unwrap(res).data
      setReport(data || { ringkasan: { total_pendapatan: 0, total_reservasi: 0 }, harian: [] })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filters])

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value })

  if (loading) return <Loading />
  if (error) return <ErrorState message={error} onRetry={load} />

  const ringkasan = report?.ringkasan || { total_pendapatan: 0, total_reservasi: 0 }
  const harian = Array.isArray(report?.harian) ? report.harian : []

  // Max revenue to scale chart bars
  const maxPendapatan = Math.max(...harian.map(d => Number(d.pendapatan) || 0), 1)

  const yearOptions = [
    { value: currentYear.toString(), label: currentYear.toString() },
    { value: (currentYear - 1).toString(), label: (currentYear - 1).toString() },
    { value: (currentYear - 2).toString(), label: (currentYear - 2).toString() }
  ]
  const monthOptions = [
    { value: '1', label: 'Januari' }, { value: '2', label: 'Februari' }, { value: '3', label: 'Maret' },
    { value: '4', label: 'April' }, { value: '5', label: 'Mei' }, { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' }, { value: '8', label: 'Agustus' }, { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' }, { value: '11', label: 'November' }, { value: '12', label: 'Desember' }
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="font-display text-3xl font-semibold text-ink mb-1">Laporan Pendapatan</h2>
        <p className="text-stone">Pantau performa finansial dan transaksi bulanan.</p>
      </div>

      <Card className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 border-stone/10 bg-white">
        <Select name="month" value={filters.month} onChange={handleChange} options={monthOptions} className="sm:w-48 bg-stone/5" />
        <Select name="year" value={filters.year} onChange={handleChange} options={yearOptions} className="sm:w-48 bg-stone/5" />
      </Card>

      <div className="grid sm:grid-cols-2 gap-6">
        <Card className="p-8 relative overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-forest/10 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
          <div className="relative z-10">
            <p className="text-sm font-medium text-stone uppercase tracking-wider mb-2">Total Pendapatan</p>
            <p className="font-display text-4xl font-semibold text-ink">{formatRupiah(ringkasan.total_pendapatan)}</p>
          </div>
        </Card>
        <Card className="p-8 relative overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-clay/10 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
          <div className="relative z-10">
            <p className="text-sm font-medium text-stone uppercase tracking-wider mb-2">Total Reservasi Selesai</p>
            <p className="font-display text-4xl font-semibold text-ink">{ringkasan.total_reservasi}</p>
          </div>
        </Card>
      </div>

      <Card className="p-6 sm:p-8 border-stone/10">
        <h3 className="font-display text-xl font-semibold text-ink mb-8">Grafik Harian</h3>

        {harian.length === 0 ? (
          <div className="py-12 text-center text-stone">Tidak ada data transaksi pada bulan ini.</div>
        ) : (
          <div className="h-64 flex items-end gap-1 sm:gap-2 pt-6">
            {harian.map((d, i) => {
              const height = ((Number(d.pendapatan) || 0) / maxPendapatan) * 100
              const isToday = new Date().getDate() === parseInt(d.tanggal.split('-')[2]) &&
                new Date().getMonth() + 1 === parseInt(filters.month) &&
                new Date().getFullYear() === parseInt(filters.year)

              return (
                <div key={i} className="flex-1 flex flex-col justify-end h-full group relative">
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-ink text-paper text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    Tgl {d.tanggal.split('-')[2]}: {formatRupiah(d.pendapatan)}
                  </div>
                  <div
                    className={`w-full rounded-t-sm transition-all duration-300 group-hover:bg-moss ${isToday ? 'bg-forest' : 'bg-sand hover:bg-stone/30'}`}
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                </div>
              )
            })}
          </div>
        )}
        <div className="flex justify-between text-xs text-stone mt-4 border-t border-stone/10 pt-4">
          <span>Tgl 1</span>
          <span>Tgl {harian.length > 0 ? harian[harian.length - 1].tanggal.split('-')[2] : '30'}</span>
        </div>
      </Card>
    </div>
  )
}
