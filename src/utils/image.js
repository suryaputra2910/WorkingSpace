// Resolves an uploaded file reference into a displayable URL.
// type: 'spaces' | 'members' | 'general'

// The API may hand back a bare filename ("abc.jpg"), a relative path
// ("/uploads/members/abc.jpg" / "uploads/members/abc.jpg") or a full URL.

const API_BASE = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')
const UPLOAD_BASE = API_BASE + '/uploads'

export function getImageUrl(filename, type = 'general') {
  if (!filename || typeof filename !== 'string') return null

  const value = filename.trim()
  if (!value) return null

  // Already a full URL (or inline data URL / local blob preview).
  if (/^(https?:|data:|blob:)/i.test(value)) {
    return value
  }

  // Relative path already containing the uploads folder.
  if (value.startsWith('/')) return API_BASE + value

  if (/^uploads\//i.test(value)) {
    return `${API_BASE}/${value}`
  }

  // Plain filename.
  return `${UPLOAD_BASE}/${type}/${value}`
}

// Picks the photo reference from an API object without guessing one field.
const PHOTO_KEYS = [
  'foto',
  'foto_url',
  'foto_profil',
  'foto_member',
  'photo',
  'avatar',
  'image'
]

export function pickPhoto(...sources) {
  for (const src of sources) {
    if (!src || typeof src !== 'object') continue

    for (const key of PHOTO_KEYS) {
      const v = src[key]

      if (typeof v === 'string' && v.trim()) {
        return v.trim()
      }
    }
  }

  return ''
}

const nonEmpty = (v) =>
  typeof v === 'string' && v.trim() ? v.trim() : ''

const extractFilenameFromUrl = (url) => {
  if (!url) return ''

  try {
    const parsed = new URL(url)
    const segments = parsed.pathname.split('/')
    return segments[segments.length - 1]
  } catch {
    const parts = url.split('/')
    return parts[parts.length - 1]
  }
}

// The photo reference stored on a Space.
export const pickSpacePhoto = (space) => {
  if (nonEmpty(space?.foto)) return space.foto
  if (nonEmpty(space?.foto_url)) return space.foto_url

  return ''
}

// Ordered, de-duplicated image URLs to try for a Space.
export function getSpaceImageSources(space) {
  const foto = nonEmpty(space?.foto)
  const fotoUrl = nonEmpty(space?.foto_url)
  const urls = []

  if (foto) {
    const filename = /^(https?:|\/)/i.test(foto)
      ? extractFilenameFromUrl(foto)
      : foto

    urls.push(getImageUrl(filename, 'spaces'))
  }

  if (fotoUrl) {
    urls.push(getImageUrl(fotoUrl, 'spaces'))

    if (!foto) {
      const filenameFallback = extractFilenameFromUrl(fotoUrl)

      if (filenameFallback) {
        urls.push(getImageUrl(filenameFallback, 'spaces'))
      }
    }
  }

  return [...new Set(urls.filter(Boolean))]
}

// True when the photo stored on `space` is the file that was just uploaded.
const baseName = (v) =>
  String(v || '').split('?')[0].split('/').pop()

export function spaceHasPhoto(space, uploadedRef) {
  const wanted = baseName(uploadedRef)

  if (!wanted) return false

  return [space?.foto, space?.foto_url].some(
    (v) => baseName(v) === wanted
  )
}