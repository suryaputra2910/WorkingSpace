import api from './axios.js'

// CreateMemberAdminDto: { username, password, nama_member, instansi, alamat, telp, foto? }
export const createMemberAdmin = (payload) => api.post('/api/admin/members', payload)
// UpdateMemberAdminDto: all fields optional
export const updateMemberAdmin = (id, payload) => api.put(`/api/admin/members/${id}`, payload)
export const deleteMemberAdmin = (id) => api.delete(`/api/admin/members/${id}`)
export const getMembersList = (params = {}) => api.get('/api/admin/members', { params })
export const getMemberById = (id) => api.get(`/api/admin/members/${id}`)
export const getMemberProfile = () => api.get('/api/auth/profile')
export const updateMemberProfile = (payload) => api.put('/api/member/profile', payload)
