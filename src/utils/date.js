// Date/time formatting helpers matching the API's expected formats:
// tanggal_reservasi = YYYY-MM-DD, jam_mulai = HH:mm

export function toApiDate(date) {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Friendly display, e.g. 2026-08-30 -> 30 Agustus 2026
export function formatDateDisplay(isoDate) {
  if (!isoDate) return '-'
  const d = new Date(isoDate)
  if (isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function isValidApiDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

export function isValidApiTime(value) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
}

// Returns the calendar date part ("YYYY-MM-DD") of an API date or ISO
// timestamp without going through Date (avoids timezone day shifts).
export function toDateOnly(value) {
  if (!value) return ''
  if (value instanceof Date) return toApiDate(value)
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/)
  return match ? `${match[1]}-${match[2]}-${match[3]}` : ''
}
