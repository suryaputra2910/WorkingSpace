import api from './axios.js'

// RegisterMemberDto: { username, password, nama_member, instansi, alamat, telp, foto? }
export const registerMember = (payload) => api.post('/api/auth/register/member', payload)

// RegisterAdminSpaceDto: { username, password, nama_coworking, nama_pemilik, telp }
export const registerAdminSpace = (payload) => api.post('/api/auth/register/admin-space', payload)

// LoginDto: { username, password }
// Requires x-maker-key header (handled automatically by the axios interceptor).
export const login = (payload) => api.post('/api/auth/login', payload)

// Returns the currently authenticated user/profile + role.
export const getProfile = () => api.get('/api/auth/profile')
