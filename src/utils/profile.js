import { pickPhoto } from './image.js'

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v)
const str = (v) => (v === null || v === undefined ? '' : String(v))

// Flattens a member/profile payload. GET /api/auth/profile nests the member
// data under `member`, while some list endpoints return it flat, so both
// shapes are read. Top-level values win, nested values fill the gaps.
export function normalizeProfile(data) {
  if (!isObj(data)) {
    return { username: '', role: '', nama: '', telp: '', instansi: '', alamat: '', foto: '' }
  }
  const nested = [data.member, data.profile, data.user, data.admin_space, data.coworking].filter(isObj)
  const layers = [data, ...nested]
  const pick = (...keys) => {
    for (const layer of layers) {
      for (const k of keys) {
        const v = layer[k]
        if (v !== undefined && v !== null && String(v).trim() !== '') return String(v)
      }
    }
    return ''
  }
  return {
    username: pick('username'),
    role: pick('role'),
    nama: pick('nama_member', 'nama_pemilik', 'nama'),
    namaCoworking: pick('nama_coworking'),
    telp: pick('telp', 'no_telp', 'telepon'),
    instansi: pick('instansi'),
    alamat: pick('alamat'),
    foto: pickPhoto(...layers),
  }
}

export function getDisplayName(user) {
  const p = normalizeProfile(user)
  return p.nama || p.username || ''
}

// Normalises one item of GET /api/admin/members (flat or nested).
export function normalizeMember(m) {
  if (!isObj(m)) return null
  const p = normalizeProfile(m)
  return {
    ...m,
    id: m.id ?? m.member?.id,
    username: p.username,
    nama_member: p.nama,
    telp: p.telp,
    instansi: p.instansi,
    alamat: p.alamat,
    foto: p.foto,
  }
}

export const initialOf = (name) => (str(name).trim().charAt(0) || '?').toUpperCase()
