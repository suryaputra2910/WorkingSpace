import api from './axios.js'

// Create/update admin member menggunakan multipart/form-data
const toFormData = (payload) => {
  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value)
    }
  })

  return formData
}

// CreateMemberAdminDto:
// username, password, nama_member, instansi, alamat, telp, foto?
export const createMemberAdmin = (payload) =>
  api.post('/api/admin/members', toFormData(payload))

// UpdateMemberAdminDto: all fields optional
export const updateMemberAdmin = (id, payload) =>
  api.put(`/api/admin/members/${id}`, toFormData(payload))

export const deleteMemberAdmin = (id) =>
  api.delete(`/api/admin/members/${id}`)

export const getMembersList = (params = {}) =>
  api.get('/api/admin/members', { params })

export const getMemberById = (id) =>
  api.get(`/api/admin/members/${id}`)

// The logged-in member's own data comes from GET /api/auth/profile