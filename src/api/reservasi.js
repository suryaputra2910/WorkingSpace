import api from './axios.js'

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
