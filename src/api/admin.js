import api from './axios.js'

// UpdateCoworkingProfileDto: { nama_coworking, nama_pemilik, telp }
export const updateCoworkingProfile = (payload) => api.put('/api/admin/profile', payload)
export const getCoworkingProfile = () => api.get('/api/admin/profile')
