import { toNumber } from './currency.js'

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

// Returns the first candidate that is a finite number (0 counts).
function firstNumber(...candidates) {
  for (const c of candidates) {
    const n = toNumber(c)
    if (n !== null) return n
  }
  return null
}

// Extracts the array of items from a list response. Endpoints return either a
// bare array or an object wrapping it ({ data: [] }, { reservasi: [] }, ...).
export function extractList(raw) {
  if (Array.isArray(raw)) return raw
  if (!isObj(raw)) return []
  for (const key of ['data', 'reservasi', 'history', 'items', 'rows', 'results']) {
    if (Array.isArray(raw[key])) return raw[key]
  }
  const firstArray = Object.values(raw).find((v) => Array.isArray(v))
  return firstArray || []
}

function sumDetails(details, keys) {
  let total = null
  for (const d of details) {
    const n = firstNumber(...keys.map((k) => d[k]))
    if (n !== null) total = (total ?? 0) + n
  }
  return total
}

// Single source of truth for reservation data. Every screen that shows a
// reservation (member list/detail/history/e-ticket, admin list/dashboard,
// reports) goes through this so price, discount, space and member fields are
// derived in exactly one place.
//
// Two DIFFERENT response shapes are handled explicitly:
//
//  1) POST /api/reservasi  -> price_breakdown carries the numbers
//       { harga_per_jam, durasi_jam, subtotal, nominal_diskon, total_harga }
//     (may be wrapped as { reservasi: {...}, price_breakdown: {...} })
//
//  2) GET /api/admin/reservasi (and other GET reservasi endpoints) ->
//     price_breakdown is empty ({}) and there is NO total on the root object.
//     The numbers live in detail_reservasi[]:
//       detail_reservasi[0].total_harga            -> amount paid (total_bayar)
//       detail_reservasi[0].space.harga_per_jam    -> price per hour
//       durasi_jam (root)                          -> duration
//       total_harga_awal = harga_per_jam * durasi_jam
export function normalizeReservasi(input) {
  if (!isObj(input)) return null

  // Unwrap { reservasi: {...}, price_breakdown: {...} } envelopes (POST).
  let r = input
  if (isObj(input.reservasi)) {
    r = { ...input.reservasi }
    if (r.price_breakdown === undefined && input.price_breakdown !== undefined) {
      r.price_breakdown = input.price_breakdown
    }
  }

  const pb = isObj(r.price_breakdown) ? r.price_breakdown : {} // {} on GET responses
  const details = Array.isArray(r.detail_reservasi) ? r.detail_reservasi.filter(isObj) : []
  const detail = details[0] || {}
  const space = isObj(detail.space) ? detail.space : isObj(r.space) ? r.space : {}
  const member = isObj(r.member) ? r.member : isObj(r.user?.member) ? r.user.member : null

  // Price per hour: POST breakdown, else detail_reservasi[0].space.harga_per_jam (GET).
  const hargaPerJam = firstNumber(pb.harga_per_jam, space.harga_per_jam, detail.harga_per_jam, r.harga_per_jam)
  const durasiJam = firstNumber(r.durasi_jam, pb.durasi_jam, detail.durasi_jam)

  // Amount before discount.
  const computedSubtotal = hargaPerJam !== null && durasiJam !== null ? hargaPerJam * durasiJam : null
  const subtotal = firstNumber(pb.subtotal, r.total_harga_awal, r.subtotal, computedSubtotal)

  const nominalDiskon = firstNumber(
    pb.nominal_diskon, detail.nominal_diskon, detail.potongan_diskon,
    r.potongan_diskon, r.nominal_diskon, r.total_diskon
  )
  const diskonObj = isObj(detail.diskon) ? detail.diskon : isObj(r.diskon) ? r.diskon : null
  const persenDiskon = firstNumber(pb.persentase_diskon, diskonObj?.persentase_diskon, r.persentase_diskon)

  // Amount actually paid. POST: price_breakdown.total_harga. GET: the total of
  // detail_reservasi[].total_harga (one row per reservation in practice, so this
  // is detail_reservasi[0].total_harga). A value that is present is used as-is,
  // including a genuine 0; a missing value stays null and renders as "-".
  const detailTotal = sumDetails(details, ['total_harga'])
  let totalBayar = firstNumber(
    pb.total_harga, pb.total_bayar, pb.total,
    detailTotal,
    r.total_bayar, r.total_harga, r.total_harga_akhir, r.grand_total, r.total_pembayaran, r.total
  )

  // Never rebuild a missing total from the Space's CURRENT price x duration:
  // that would invent a historical amount. Only the POST price_breakdown
  // snapshot (created together with the reservation) may be used for that.
  const pbSubtotal = toNumber(pb.subtotal)
  if (totalBayar === null && pbSubtotal !== null) {
    const potong = nominalDiskon ?? (persenDiskon !== null ? Math.round((pbSubtotal * persenDiskon) / 100) : 0)
    totalBayar = Math.max(pbSubtotal - potong, 0)
  }

  // Discount shown = reported nominal, else the gap between subtotal and what was paid,
  // else derived from the percentage.
  let potongan = nominalDiskon
  if (potongan === null && subtotal !== null && totalBayar !== null) potongan = subtotal - totalBayar
  if (potongan === null && subtotal !== null && persenDiskon !== null) {
    potongan = Math.round((subtotal * persenDiskon) / 100)
  }

return {
  ...r,
  member,

  // Space
  id_space: r.id_space ?? detail.id_space ?? space.id,
  nama_space:
    space.nama_space ??
    detail.nama_space ??
    space.nama ??
    space.name ??
    r.nama_space ??
    r.space_nama ??
    '',

  // Foto space
  foto_space:
    space.foto_url ??
    (space.foto
      ? `http://learn.smktelkom-mlg.sch.id/uploads/spaces/${space.foto}`
      : null),

  foto_space_filename: space.foto ?? null,

  // Member
  nama_member: member?.nama_member ?? r.nama_member ?? '',

  // Price
  harga_per_jam: hargaPerJam,
  durasi_jam: durasiJam,
  total_harga_awal: subtotal,
  potongan_diskon: potongan !== null && potongan > 0 ? potongan : 0,
  total_bayar: totalBayar,
  status: r.status,
}
}

// Normalises an API list response into an array of normalised reservations.
export function normalizeReservasiList(raw) {
  return extractList(raw).map(normalizeReservasi).filter(Boolean)
}
