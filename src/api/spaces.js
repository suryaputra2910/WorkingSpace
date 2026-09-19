import api from './axios.js'

// Public space endpoints
export const getSpaces = (params = {}) => api.get('/api/spaces', { params })
export const getSpaceById = (id) => api.get(`/api/spaces/${id}`)
export const getSpaceTypes = () => api.get('/api/spaces/types')
export const getSpaceAvailability = (params = {}) => api.get('/api/spaces/availability', { params })

// Admin space management
// CreateSpaceDto: { nama_space, harga_per_jam, tipe, kapasitas, deskripsi, foto? }
export const createSpace = (payload) => api.post('/api/admin/spaces', payload)
// UpdateSpaceDto: all fields optional
export const updateSpace = (id, payload) => api.put(`/api/admin/spaces/${id}`, payload)
export const deleteSpace = (id) => api.delete(`/api/admin/spaces/${id}`)
