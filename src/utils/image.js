// Resolves an uploaded filename into a full displayable URL.
// type: 'spaces' | 'members' | 'general'
const UPLOAD_BASE = import.meta.env.VITE_API_URL.replace(/\/$/, '') + '/uploads'

export function getImageUrl(filename, type = 'general') {
  if (!filename) return null
  // Already a full URL (e.g. external link) — return as-is.
  if (/^https?:\/\//i.test(filename)) return filename
  return `${UPLOAD_BASE}/${type}/${filename}`
}
