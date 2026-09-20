import { useEffect, useMemo, useRef, useState } from 'react'
import { getMonthlyReport, getIncomeReport } from '../../api/reports.js'
import { fetchAllAdminReservasi } from '../../api/reservasi.js'
import { unwrap, getErrorMessage } from '../../api/axios.js'
import Card from '../../components/ui/Card.jsx'
import Select from '../../components/ui/Select.jsx'
import Table from '../../components/ui/Table.jsx'
import StatusBadge from '../../components/ui/Badge.jsx'
import Loading from '../../components/common/Loading.jsx'
import Avatar from '../../components/common/Avatar.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'
import { formatRupiah } from '../../utils/currency.js'
import { formatDateDisplay } from '../../utils/date.js'
import { normalizeReservasi } from '../../utils/reservasi.js'
import {
  MONTH_NAMES, STATUS_ORDER, buildIncomeReport, pickReportIncome,
  getMemberPhoto, getSpacePhoto, compareStatus,
} from '../../utils/report.js'

const MODES = [
  { key: 'bulanan', label: 'Bulanan' },
  { key: 'tahunan', label: 'Tahunan' },
]

export default function Reports() {
  const now = new Date()
  const currentYear = now.getFullYear()

  const [filters, setFilters] = useState({
    mode: 'bulanan',
    month: String(now.getMonth() + 1),
    year: String(currentYear),
  })
  const [reservasi, setReservasi] = useState([])
  const [compare, setCompare] = useState({ monthly: null, income: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const requestId = useRef(0)

  const load = async () => {
    const id = ++requestId.current
    const { mode, month, year } = filters
    setLoading(true)
    setError(null)

    try {
      const periodParams = mode === 'tahunan' ? { year } : { month, year }
      const months = mode === 'tahunan' ? Array.from({ length: 12 }, (_, i) => String(i + 1)) : [month]

      // 1) Source of truth: the reservation rows for the selected period.
      // 2) Cross-check: the existing report endpoints for the same period.
      //    Those are best-effort; a failure there never blocks the report.
      const [rows, monthlyResults, incomeResult] = await Promise.all([
        fetchAllAdminReservasi(periodParams),
        Promise.allSettled(months.map((m) => getMonthlyReport({ month: m, year }))),
        Promise.allSettled([getIncomeReport(periodParams)]),
      ])

      if (id !== requestId.current) return // a newer filter change superseded this request

      const monthlyPicks = monthlyResults
        .filter((r) => r.status === 'fulfilled')
        .map((r) => pickReportIncome(unwrap(r.value).data))
        .filter(Boolean)
      const incomePick = incomeResult[0].status === 'fulfilled'
        ? pickReportIncome(unwrap(incomeResult[0].value).data)
        : null

      setCompare({
        monthly: monthlyPicks.length > 0 ? monthlyPicks.reduce((sum, p) => sum + p.value, 0) : null,
        income: incomePick ? incomePick.value : null,
      })
      setReservasi(rows.map(normalizeReservasi).filter(Boolean))
    } catch (err) {
      if (id !== requestId.current) return
      setError(getErrorMessage(err))
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }

  useEffect(() => { load() }, [filters])

  const handleChange = (e) => setFilters((f) => ({ ...f, [e.target.name]: e.target.value }))

  // Everything shown below derives from the loaded reservation rows.
  const report = useMemo(() => buildIncomeReport(reservasi, filters), [reservasi, filters])

  const periodLabel = filters.mode === 'tahunan'
    ? `Tahun ${filters.year}`
    : `${MONTH_NAMES[Number(filters.month) - 1]} ${filters.year}`

  const yearOptions = useMemo(() => {
    const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i))
    if (!years.includes(filters.year)) years.push(filters.year)
    return years.map((y) => ({ value: y, label: y }))
  }, [currentYear, filters.year])

  const monthOptions = MONTH_NAMES.map((label, i) => ({ value: String(i + 1), label }))

  const maxValue = Math.max(...report.series.map((s) => s.value), 1)

  const columns = [
    { key: 'tanggal', header: 'Tanggal', render: (r) => formatDateDisplay(r.tanggal_reservasi) },
    {
      key: 'space',
      header: 'Space',
      render: (r) => (
        <div className="flex items-center gap-3 min-w-[9rem]">
          <Avatar foto={getSpacePhoto(r)} name={r.nama_space} type="spaces" shape="square" className="w-10 h-10 text-xs" />
          <span>{r.nama_space || '-'}</span>
        </div>
      ),
    },
    {
      key: 'member',
      header: 'Member',
      render: (r) => (
        <div className="flex items-center gap-3 min-w-[9rem]">
          <Avatar foto={getMemberPhoto(r)} name={r.nama_member} type="members" className="w-8 h-8 text-xs" />
          <span>{r.nama_member || '-'}</span>
        </div>
      ),
    },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'total', header: 'Pendapatan', render: (r) => <span className="font-medium">{formatRupiah(r.total_bayar)}</span> },
  ]

  const compareRows = [
    { label: 'Endpoint /reports/monthly', value: compare.monthly },
    { label: 'Endpoint /reports/income', value: compare.income },
  ].filter((c) => c.value !== null)
  const hasMismatch = compareRows.some((c) => compareStatus(c.value, report) !== 'sesuai')

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="font-display text-3xl font-semibold text-ink mb-1">Laporan Pendapatan</h2>
        <p className="text-stone">
          Pendapatan realisasi hanya dihitung dari reservasi berstatus <span className="font-medium text-ink">Selesai</span>.
        </p>
      </div>

      <Card className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 border-stone/10 bg-white">
        <div className="inline-flex p-1 bg-stone/5 border border-stone/10 rounded-lg" role="tablist" aria-label="Periode laporan">
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              role="tab"
              aria-selected={filters.mode === m.key}
              onClick={() => setFilters((f) => ({ ...f, mode: m.key }))}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                filters.mode === m.key ? 'bg-white text-ink shadow-soft' : 'text-stone hover:text-ink'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        {filters.mode === 'bulanan' && (
          <Select name="month" value={filters.month} onChange={handleChange} options={monthOptions} className="sm:w-44 bg-stone/5" />
        )}
       <input type="number" name="year" value={filters.year} onChange={handleChange} placeholder="Tahun" className="h-10 sm:w-40 rounded-lg border border-stone/20 bg-stone/5 px-3 text-sm text-ink outline-none focus:border-forest focus:ring-1 focus:ring-forest"/>
      </Card>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-6">
            <Card className="p-8 relative overflow-hidden group">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-forest/10 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
              <div className="relative z-10">
                <p className="text-sm font-medium text-stone uppercase tracking-wider mb-2">Pendapatan Realisasi</p>
                <p className="font-display text-4xl font-semibold text-ink">{formatRupiah(report.total)}</p>
                <p className="text-xs text-stone mt-2">{periodLabel}</p>
              </div>
            </Card>
            <Card className="p-8 relative overflow-hidden group">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-clay/10 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
              <div className="relative z-10">
                <p className="text-sm font-medium text-stone uppercase tracking-wider mb-2">Total Reservasi Selesai</p>
                <p className="font-display text-4xl font-semibold text-ink">{report.count}</p>
                <p className="text-xs text-stone mt-2">dari {report.totalInPeriod} reservasi pada periode ini</p>
              </div>
            </Card>
          </div>

          <Card className="p-5 border-stone/10">
            <p className="text-sm font-medium text-ink mb-3">Jumlah reservasi per status ({periodLabel})</p>
            <div className="flex flex-wrap gap-4">
              {STATUS_ORDER.map((status) => (
                <div key={status} className="flex items-center gap-2 text-sm">
                  <StatusBadge status={status} />
                  <span className="font-medium text-ink tabular-nums">{report.byStatus[status]}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 sm:p-8 border-stone/10">
            <h3 className="font-display text-xl font-semibold text-ink mb-8">
              {filters.mode === 'tahunan' ? 'Grafik Bulanan' : 'Grafik Harian'}
            </h3>

            {report.count === 0 ? (
              <div className="py-12 text-center text-stone">Tidak ada reservasi selesai pada periode ini.</div>
            ) : (
              <>
                <div className="h-64 flex items-end gap-1 sm:gap-2 pt-6">
                  {report.series.map((s) => (
                    <div key={s.key} className="flex-1 flex flex-col justify-end h-full group relative">
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-ink text-paper text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        {filters.mode === 'tahunan' ? s.label : `Tgl ${s.label}`}: {formatRupiah(s.value)}
                      </div>
                      <div
                        className={`w-full rounded-t-sm transition-all duration-300 group-hover:bg-moss ${s.value > 0 ? 'bg-forest' : 'bg-sand'}`}
                        style={{ height: `${Math.max((s.value / maxValue) * 100, 2)}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-1 sm:gap-2 text-[10px] sm:text-xs text-stone mt-3 border-t border-stone/10 pt-3">
                  {report.series.map((s, i) => (
                    <span key={s.key} className="flex-1 text-center">
                      {filters.mode === 'tahunan' || i === 0 || (i + 1) % 5 === 0 ? s.label : ''}
                    </span>
                  ))}
                </div>
              </>
            )}
          </Card>

          {/* {compareRows.length > 0 && (
            <Card className="p-5 border-stone/10">
              <p className="text-sm font-medium text-ink mb-3">Pembanding dari endpoint laporan</p>
              <div className="space-y-2 text-sm">
                {compareRows.map((c) => {
                  const st = compareStatus(c.value, report)
                  const style = {
                    sesuai: 'bg-forest/10 text-forest border-forest/20',
                    berbeda: 'bg-brick/10 text-brick border-brick/20',
                    'tidak-pasti': 'bg-clay/10 text-clay border-clay/20',
                  }[st]
                  const text = { sesuai: 'Sesuai', berbeda: 'Berbeda', 'tidak-pasti': 'Belum bisa dipastikan' }[st]
                  return (
                    <div key={c.label} className="flex items-center justify-between gap-4">
                      <span className="text-stone">{c.label}</span>
                      <span className="flex items-center gap-3">
                        <span className="font-medium text-ink">{formatRupiah(c.value)}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${style}`}>{text}</span>
                      </span>
                    </div>
                  )
                })}
              </div>
              {hasMismatch && (
                <p className="text-xs text-stone mt-3">
                  Angka utama di atas hanya dari reservasi berstatus Selesai. Selisih berarti endpoint laporan menghitung
                  berbeda (status/periode lain, atau nominalnya belum terisi di sisi API).
                </p>
              )}
            </Card>
          )} */}

          <Card className="p-0 border-stone/10">
            <div className="px-5 py-4 border-b border-stone/10">
              <h3 className="font-display text-lg font-semibold text-ink">Rincian Reservasi Selesai</h3>
              <p className="text-xs text-stone mt-0.5">Data yang dijumlahkan menjadi pendapatan realisasi.</p>
            </div>
            <Table columns={columns} data={report.rows} emptyMessage="Tidak ada reservasi selesai pada periode ini." />
          </Card>
        </>
      )}
    </div>
  )
}
