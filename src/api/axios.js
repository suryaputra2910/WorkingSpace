import axios from 'axios'

// Base Axios instance for the Coworking Space API.
// App Key and Bearer token are attached automatically via interceptors below,
// so no other file should ever read/write localStorage for these values directly.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

const APP_KEY_STORAGE = 'coworking_app_key'
const TOKEN_STORAGE = 'coworking_access_token'

// Default App Key for this frontend instance, provided via environment
// variable so it never has to be hardcoded in any service or page.
// See .env -> VITE_APP_KEY.
const ENV_APP_KEY = import.meta.env.VITE_APP_KEY

export const appKeyStorage = {
  // Falls back to the App Key baked into the environment (VITE_APP_KEY) when
  // no App Key has been manually registered/stored at runtime. This means
  // every request is covered by default without touching individual
  // services or pages.
  get: () => localStorage.getItem(APP_KEY_STORAGE) || ENV_APP_KEY || null,
  set: (key) => localStorage.setItem(APP_KEY_STORAGE, key),
  clear: () => localStorage.removeItem(APP_KEY_STORAGE),
}

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_STORAGE),
  set: (token) => localStorage.setItem(TOKEN_STORAGE, token),
  clear: () => localStorage.removeItem(TOKEN_STORAGE),
}

// Request interceptor: attach x-maker-key (App Key) and Authorization (JWT)
// automatically to every request made through this instance. This is the
// single place the App Key is ever read/sent — no other file should
// reference the key directly.
api.interceptors.request.use((config) => {
  const appKey = appKeyStorage.get()
  const token = tokenStorage.get()

  if (appKey) {
    config.headers['x-maker-key'] = appKey
  }
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// Response interceptor: unwrap the standard envelope and handle 401 globally.
let onUnauthorized = null
export const registerUnauthorizedHandler = (fn) => {
  onUnauthorized = fn
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenStorage.clear()
      localStorage.removeItem('coworking_user')
      if (onUnauthorized) onUnauthorized()
    }
    return Promise.reject(error)
  }
)

// Helper to consistently unpack the API's standard response envelope:
// { status, statusCode, message, data, timestamp }
export function unwrap(response) {
  const body = response?.data ?? {}
  return {
    status: body.status,
    message: body.message,
    data: body.data,
  }
}

// Converts any API `message` shape into a plain string. NestJS validation
// errors arrive as an array (sometimes of objects); passing those straight to
// a toast/JSX makes React throw "Objects are not valid as a React child",
// which unmounts the whole tree and leaves a white screen.
function messageToString(m) {
  if (m === null || m === undefined) return ''
  if (typeof m === 'string') return m
  if (Array.isArray(m)) return m.map(messageToString).filter(Boolean).join(', ')
  if (typeof m === 'object') {
    if (typeof m.message === 'string') return m.message
    if (m.errors !== undefined) return messageToString(m.errors)
    if (m.constraints && typeof m.constraints === 'object') return messageToString(Object.values(m.constraints))
    try { return JSON.stringify(m) } catch { return '' }
  }
  return String(m)
}

// Helper to extract a friendly error message from the standard error envelope:
// { status, statusCode, message, error, timestamp }. Always returns a string.
export function getErrorMessage(error) {
  const body = error?.response?.data
  const fromBody = messageToString(body?.message) || messageToString(body?.error)
  if (fromBody) return fromBody
  const fromError = messageToString(error?.message)
  if (fromError) return fromError
  return 'Terjadi kesalahan yang tidak diketahui.'
}

export default api
