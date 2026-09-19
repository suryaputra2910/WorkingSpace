import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { tokenStorage, appKeyStorage, registerUnauthorizedHandler, unwrap, getErrorMessage } from '../api/axios.js'
import { login as loginApi, getProfile } from '../api/auth.js'
import { registerMaker as registerMakerApi } from '../api/maker.js'

const AuthContext = createContext(null)
const USER_STORAGE = 'coworking_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_STORAGE)
    return raw ? JSON.parse(raw) : null
  })
  const [appKey, setAppKey] = useState(() => appKeyStorage.get())
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // role is derived from the profile response, e.g. user.role
  const role = user?.role ?? null

  const logout = useCallback(() => {
    tokenStorage.clear()
    localStorage.removeItem(USER_STORAGE)
    setUser(null)
    navigate('/login')
  }, [navigate])

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      setUser(null)
      toast.error('Sesi Anda telah berakhir. Silakan login kembali.')
      navigate('/login')
    })
  }, [navigate])

  // Rehydrate the session on load by asking the API who we are.
  useEffect(() => {
    async function bootstrap() {
      const token = tokenStorage.get()
      if (!token) {
        setIsLoading(false)
        return
      }
      try {
        const res = await getProfile()
        const { data } = unwrap(res)
        setUser(data)
        localStorage.setItem(USER_STORAGE, JSON.stringify(data))
      } catch {
        tokenStorage.clear()
        localStorage.removeItem(USER_STORAGE)
      } finally {
        setIsLoading(false)
      }
    }
    bootstrap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Registers the frontend's App Key (maker key) required for multi-tenancy.
  // Call this once, e.g. from a setup/onboarding screen, before login/register.
  const registerMakerKey = useCallback(async (payload) => {
    const res = await registerMakerApi(payload)
    const { data } = unwrap(res)
    const key = data?.app_key
    if (key) {
      appKeyStorage.set(key)
      setAppKey(key)
    }
    return data
  }, [])

  const setManualAppKey = useCallback((key) => {
    appKeyStorage.set(key)
    setAppKey(key)
  }, [])

  const login = useCallback(async (payload) => {
    const res = await loginApi(payload)
    const { data } = unwrap(res)
    // Expecting something like { access_token, user/profile, role } — the
    // exact shape of `data` isn't fully confirmed against the live backend,
    // so we defensively pull out the pieces we need.
    const token = data?.access_token
    if (token) tokenStorage.set(token)

    const profile = data?.user ?? data?.profile ?? data
    setUser(profile)
    localStorage.setItem(USER_STORAGE, JSON.stringify(profile))
    return profile
  }, [])

  const value = {
    user,
    role,
    appKey,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    registerMakerKey,
    setManualAppKey,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export { getErrorMessage }
