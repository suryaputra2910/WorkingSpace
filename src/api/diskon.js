import api from './axios.js'

// CheckPromoDto: { nama_diskon }
export const checkPromo = (payload) => api.post('/api/diskon/check', payload)

// Admin diskon management
// CreateDiskonDto: { nama_diskon, persentase_diskon, tanggal_awal, tanggal_akhir }
export const createDiskon = (payload) => api.post('/api/admin/diskon', payload)
// UpdateDiskonDto: all fields optional
export const updateDiskon = (id, payload) => api.put(`/api/admin/diskon/${id}`, payload)
export const deleteDiskon = (id) => api.delete(`/api/admin/diskon/${id}`)
export const getDiskonList = (params = {}) => api.get('/api/admin/diskon', { params })
export const getDiskonById = (id) => api.get(`/api/admin/diskon/${id}`)
