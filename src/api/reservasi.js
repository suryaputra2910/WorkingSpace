import api, { unwrap } from './axios.js'
import { extractList } from '../utils/reservasi.js'

// CreateReservasiDto: { id_space, tanggal_reservasi, jam_mulai, durasi_jam, id_diskon?, kode_promo? }
export const createReservasi = (payload) => api.post('/api/reservasi', payload)

// Member reservation endpoints
export const getMyReservasi = (params = {}) => api.get('/api/reservasi/my', { params })
export const getMyReservasiHistory = (params = {}) => api.get('/api/reservasi/my/history', { params })
export const getReservasiById = (id) => api.get(`/api/reservasi/${id}`)
export const getReservasiETicket = (id) => api.get(`/api/reservasi/${id}/e-ticket`)
export const cancelReservasi = (id) => api.patch(`/api/reservasi/${id}/cancel`)

// Admin reservation endpoints
// Filters: ?month= &year= &status= &id_space= &tanggal=
export const getAdminReservasi = (params = {}) => api.get('/api/admin/reservasi', { params })
// UpdateReservasiStatusDto: { status }
export const updateReservasiStatus = (id, status) =>
  api.patch(`/api/admin/reservasi/${id}/status`, { status })
export const checkInReservasi = (id) => api.post(`/api/admin/reservasi/${id}/check-in`)
export const checkOutReservasi = (id) => api.post(`/api/admin/reservasi/${id}/check-out`)

// Loads EVERY page of GET /api/admin/reservasi for the given filters, so
// totals (dashboard, reports) are never computed from a truncated first page.
// Pages are de-duplicated by id, which also makes this safe if the server
// ignores the paging params (page 2 then adds nothing and the loop stops).
export async function fetchAllAdminReservasi(params = {}, { pageSize = 100, maxPages = 50 } = {}) {
  const items = []
  const seen = new Set()

  for (let page = 1; page <= maxPages; page += 1) {
    let raw
    try {
      raw = unwrap(await getAdminReservasi({ ...params, page, limit: pageSize })).data
    } catch (err) {
      // Paging params rejected by validation: fall back to a single plain request.
      if (page === 1 && err?.response?.status === 400) {
        return extractList(unwrap(await getAdminReservasi(params)).data)
      }
      throw err
    }

    const list = extractList(raw)
    let added = 0
    for (const item of list) {
      const key = item?.id ?? JSON.stringify(item)
      if (!seen.has(key)) {
        seen.add(key)
        items.push(item)
        added += 1
      }
    }

    const totalPages = raw?.meta?.totalPages ?? raw?.pagination?.totalPages ?? raw?.totalPages
    if (added === 0 || (totalPages && page >= Number(totalPages))) break
  }
  return items
}
