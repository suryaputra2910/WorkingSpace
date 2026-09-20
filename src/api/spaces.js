import api from './axios.js'

// Public space endpoints
export const getSpaces = (params = {}) =>
  api.get('/api/spaces', { params })

export const getSpaceById = (id) =>
  api.get(`/api/spaces/${id}`)

export const getSpaceTypes = () =>
  api.get('/api/spaces/types')

export const getSpaceAvailability = (params = {}) =>
  api.get('/api/spaces/availability', { params })

const toFormData = (payload) => {
  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value)
    }
  })

  return formData
}

// Admin space management
export const createSpace = (payload) => {
  const formData = toFormData(payload)

  for (const [key, value] of formData.entries()) {
    console.log(
      'FORM DATA:',
      key,
      value instanceof File
        ? {
            name: value.name,
            type: value.type,
            size: value.size,
          }
        : value
    )
  }

  return api.post('/api/admin/spaces', formData)
}

export const updateSpace = (id, payload) => {
  const formData = toFormData(payload)

  for (const [key, value] of formData.entries()) {
    console.log(
      'FORM DATA:',
      key,
      value instanceof File
        ? {
            name: value.name,
            type: value.type,
            size: value.size,
          }
        : value
    )
  }

  return api.put(`/api/admin/spaces/${id}`, formData)
}

export const deleteSpace = (id) =>
  api.delete(`/api/admin/spaces/${id}`)