// Currency helpers.
//
// The API may return money as a number (1600), a Decimal string ("1600.00")
// or omit it entirely. `toNumber` normalises all of those to a finite number,
// or `null` when the value is genuinely missing/invalid, so callers can tell
// "unknown" apart from a real 0.
export function toNumber(value) {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string') {
    const cleaned = value.trim()
    if (cleaned === '') return null
    const n = Number(cleaned)
    return Number.isFinite(n) ? n : null
  }
  return null
}

// Format a number as Indonesian Rupiah with dot separators:
//   1600 -> "Rp 1.600", 250000 -> "Rp 250.000"
// Missing/invalid values render as "-" (never "Rp undefined", "NaN" or a
// fake "Rp 0"). A real numeric 0 still renders as "Rp 0".
export function formatRupiah(value) {
  const n = toNumber(value)
  if (n === null) return '-'
  const rounded = Math.round(Math.abs(n))
  const grouped = String(rounded).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${n < 0 ? '-' : ''}Rp ${grouped}`
}
