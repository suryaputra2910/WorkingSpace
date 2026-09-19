import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth, getErrorMessage } from '../../context/AuthContext.jsx'
import Input from '../../components/ui/Input.jsx'
import Button from '../../components/ui/Button.jsx'
import { runValidation, required } from '../../utils/validation.js'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = runValidation(form, {
      username: [(v) => required(v, 'Username')],
      password: [(v) => required(v, 'Password')],
    })
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setIsLoading(true)
    try {
      const profile = await login(form)
      toast.success('Login berhasil')
      navigate(profile?.role === 'admin_space' ? '/admin/dashboard' : '/member/dashboard')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-8 text-center sm:text-left">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-ink mb-2">Selamat Datang Kembali</h2>
        <p className="text-sm text-stone leading-relaxed">
          Masuk ke akun Anda untuk mulai mengelola reservasi ruang kerja.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <Input
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            error={errors.username}
            placeholder="Masukkan username Anda"
            autoComplete="username"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        <div className="pt-2">
          <Button type="submit" className="w-full text-base py-3" size="lg" isLoading={isLoading}>
            Masuk ke Akun
          </Button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-stone/10 text-center sm:text-left">
        <p className="text-sm text-stone">
          Belum punya akun?{' '}
          <Link to="/register" className="text-forest font-medium hover:text-moss transition-colors">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  )
}
