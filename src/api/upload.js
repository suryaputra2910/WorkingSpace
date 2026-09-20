import api, { unwrap } from './axios.js'

// Multipart upload helpers for POST /api/upload/{image|spaces|members}.
//
// IMPORTANT: the shared axios instance defaults to `Content-Type:
// application/json`. With that header axios serialises a FormData body into
// JSON (File -> {}), so the server receives no file and answers
// "File ... tidak ditemukan". Every upload therefore forces
// `multipart/form-data`; the browser then adds the boundary automatically.
const MULTIPART = { headers: { 'Content-Type': 'multipart/form-data' } }

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024

// Returns an error message, or null when the file is an acceptable image.
export function validateImageFile(file) {
  if (!(file instanceof File)) return 'File foto tidak valid.'
  if (!file.type.startsWith('image/')) return 'File harus berupa gambar (JPG/PNG).'
  if (file.size > MAX_IMAGE_BYTES) return 'Ukuran foto maksimal 2MB.'
  return null
}

async function postFile(url, file) {
  const err = validateImageFile(file)
  if (err) throw new Error(err)

  const send = (field) => {
    const formData = new FormData()
    formData.append(field, file, file.name)
    return api.post(url, formData, MULTIPART)
  }

  try {
    return await send('file')
  } catch (error) {
    // Some deployments of this API read the part named "foto" instead of
    // "file". Retry once with that name only when the server explicitly says
    // it did not find the uploaded file.
    const status = error?.response?.status
    const msg = String(error?.response?.data?.message ?? '')
    if ((status === 400 || status === 422) && /tidak ditemukan|not found/i.test(msg)) {
      return send('foto')
    }
    throw error
  }
}

export const uploadGeneralImage = (file) => postFile('/api/upload/image', file)
export const uploadSpaceImage = (file) => postFile('/api/upload/spaces', file)
export const uploadMemberImage = (file) => postFile('/api/upload/members', file)

// Reads the stored file reference(s) out of an upload response. The value the
// upload endpoint returns is exactly what must be saved in `foto`.
// The whole response body is inspected (top level, `data`, nested `file`), so
// it works whether the API wraps the result in { status, data } or not.
// Returned in preference order: plain filename first, then path / URL forms.
const NAME_KEYS = ['filename', 'file_name', 'fileName', 'foto', 'nama_file']
const PATH_KEYS = ['path', 'url', 'foto_url', 'location']

export function extractUploadedCandidates(res) {
  const body = res?.data
  const layers = []
  const add = (v) => {
    if (typeof v === 'string' && v.trim()) layers.push(v.trim())
    else if (v && typeof v === 'object' && !Array.isArray(v)) layers.push(v)
  }
  add(body)
  add(body?.data)
  add(body?.data?.data)
  add(body?.file)
  add(body?.data?.file)

  const found = []
  for (const keys of [NAME_KEYS, PATH_KEYS]) {
    for (const layer of layers) {
      if (typeof layer === 'string') {
        if (keys === NAME_KEYS) found.push(layer)
        continue
      }
      for (const key of keys) {
        const v = layer[key]
        if (typeof v === 'string' && v.trim()) found.push(v.trim())
      }
    }
  }
  return [...new Set(found)]
}

export const extractUploadedFilename = (res) => extractUploadedCandidates(res)[0] || ''
