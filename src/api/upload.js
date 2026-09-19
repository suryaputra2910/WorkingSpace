import api from './axios.js'

// Generic multipart/form-data upload helpers.
// Each expects a File object and returns the standard API envelope, whose
// `data` shape is not fully known yet — treat it as { filename } by default
// and adjust once the real response is confirmed against the backend.
function buildFormData(file, fieldName = 'file') {
  const formData = new FormData()
  formData.append(fieldName, file)
  return formData
}

export const uploadGeneralImage = (file) =>
  api.post('/api/upload/image', buildFormData(file))

export const uploadSpaceImage = (file) =>
  api.post('/api/upload/spaces', buildFormData(file))

export const uploadMemberImage = (file) =>
  api.post('/api/upload/members', buildFormData(file))
