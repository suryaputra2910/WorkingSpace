// Format a number as Indonesian Rupiah, e.g. 25000 -> "Rp 25.000"
export function formatRupiah(value) {
  const number = Number(value) || 0
  return 'Rp ' + number.toLocaleString('id-ID', { maximumFractionDigits: 0 })
}
