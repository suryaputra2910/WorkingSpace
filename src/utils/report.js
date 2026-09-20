import { toDateOnly } from './date.js'
import { pickPhoto } from './image.js'

export const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]
export const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

export const STATUS_ORDER = ['belum_dikonfirm', 'disetujui', 'aktif', 'selesai', 'dibatalkan']

// Only reservations with this status count as realised income.
export const REALIZED_STATUS = 'selesai'

export const daysInMonth = (year, month) => new Date(Number(year), Number(month), 0).getDate()

// Keeps only reservations whose reservation date falls inside the period.
// mode 'bulanan' -> year+month, mode 'tahunan' -> year. Items without a
// parseable date are dropped so they can never leak into another period.
export function filterByPeriod(list, { mode, year, month }) {
  return list.filter((r) => {
    const d = toDateOnly(r.tanggal_reservasi)
    if (!d) return false
    const [y, m] = d.split('-')
    if (Number(y) !== Number(year)) return false
    return mode === 'tahunan' ? true : Number(m) === Number(month)
  })
}

// Builds the report entirely from reservation rows:
//  - total/count: ONLY status "selesai" (realised income)
//  - byStatus: counts of every status in the period, for cross-checking
//  - series: per-day (monthly view) or per-month (yearly view) realised income
export function buildIncomeReport(list, { mode, year, month }) {
  const inPeriod = filterByPeriod(list, { mode, year, month })

  const byStatus = Object.fromEntries(STATUS_ORDER.map((s) => [s, 0]))
  for (const r of inPeriod) {
    if (r.status in byStatus) byStatus[r.status] += 1
  }

  const realized = inPeriod.filter((r) => r.status === REALIZED_STATUS)
  const withTotal = realized.filter((r) => typeof r.total_bayar === 'number')
  const total = withTotal.reduce((sum, r) => sum + r.total_bayar, 0)
  const missingTotal = realized.length - withTotal.length

  const size = mode === 'tahunan' ? 12 : daysInMonth(year, month)
  const series = Array.from({ length: size }, (_, i) => ({
    key: i + 1,
    label: mode === 'tahunan' ? MONTH_SHORT[i] : String(i + 1),
    value: 0,
    count: 0,
  }))
  for (const r of withTotal) {
    const [, m, d] = toDateOnly(r.tanggal_reservasi).split('-')
    const idx = (mode === 'tahunan' ? Number(m) : Number(d)) - 1
    if (series[idx]) {
      series[idx].value += r.total_bayar
      series[idx].count += 1
    }
  }

  const rows = [...realized].sort((a, b) =>
    toDateOnly(b.tanggal_reservasi).localeCompare(toDateOnly(a.tanggal_reservasi))
  )

  return { total, count: realized.length, missingTotal, byStatus, series, rows, totalInPeriod: inPeriod.length }
}

// Reads a money figure out of a report endpoint response without assuming a
// single field name. Returns null when nothing recognisable is present.
const INCOME_KEYS = [
  'pendapatan_realisasi', 'realisasi_pendapatan', 'total_realisasi', 'realisasi',
  'total_pendapatan', 'pendapatan', 'total_income', 'income',
]
export function pickReportIncome(data) {
  const layers = [data, data?.ringkasan, data?.summary]
  for (const layer of layers) {
    if (!layer || typeof layer !== 'object') continue
    for (const key of INCOME_KEYS) {
      const n = Number(layer[key])
      if (layer[key] !== undefined && layer[key] !== null && layer[key] !== '' && Number.isFinite(n)) {
        return { key, value: n }
      }
    }
  }
  return null
}

// Photos for the "Rincian" rows, read from the structure the API returns:
//   reservation.member.{foto|foto_url}
//   reservation.detail_reservasi[0].space.{foto|foto_url}
export const getMemberPhoto = (r) => pickPhoto(r?.member, r)
export const getSpacePhoto = (r) => pickPhoto(r?.detail_reservasi?.[0]?.space, r?.space)

// Compares the frontend total with what a report endpoint returned.
//  'sesuai'      -> same amount, and the frontend figure is trustworthy
//  'berbeda'     -> amounts differ
//  'tidak-pasti' -> equal only because both are 0 while "selesai" rows exist,
//                   or some selesai rows have no amount: cannot be confirmed
export function compareStatus(endpointValue, report) {
  if (Math.round(endpointValue) !== Math.round(report.total)) return 'berbeda'
  if (report.count > 0 && (report.total === 0 || report.missingTotal > 0)) return 'tidak-pasti'
  return 'sesuai'
}
