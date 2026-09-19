import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth, getErrorMessage } from '../../context/AuthContext.jsx'
import Input from '../../components/ui/Input.jsx'
import Button from '../../components/ui/Button.jsx'
import { runValidation, required, minLength } from '../../utils/validation.js'

export default function SetupAppKeyPage() {
  const { registerMakerKey, setManualAppKey } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' })
  const [manualKey, setManualKey] = useState('')
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = runValidation(form, {
      name: [(v) => required(v, 'Nama')],
      username: [(v) => required(v, 'Username')],
      email: [(v) => required(v, 'Email')],
      password: [(v) => required(v, 'Password'), (v) => minLength(v, 6, 'Password')],
    })
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setIsLoading(true)
    try {
      await registerMakerKey(form)
      toast.success('App Key berhasil dibuat')
      navigate('/login')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  const handleUseExistingKey = () => {
    if (!manualKey.trim()) {
      toast.error('Masukkan App Key terlebih dahulu')
      return
    }
    setManualAppKey(manualKey.trim())
    toast.success('App Key tersimpan')
    navigate('/login')
  }

  return (
    <div className="w-full max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
      <div className="mb-8 text-center sm:text-left">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-ink mb-2">Setup App Key</h2>
        <p className="text-sm text-stone leading-relaxed">
          Aplikasi ini memerlukan App Key untuk multi-tenancy. Buat App Key baru
          atau gunakan App Key yang sudah Anda miliki.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nama" name="name" value={form.name} onChange={handleChange} error={errors.name} />
        <Input label="Username" name="username" value={form.username} onChange={handleChange} error={errors.username} />
        <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} />
        <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} />
        
        <div className="pt-2">
          <Button type="submit" className="w-full text-base py-3" size="lg" isLoading={isLoading}>
            Buat App Key
          </Button>
        </div>
      </form>

      <div className="flex items-center gap-4 my-8">
        <span className="h-px bg-stone/20 flex-1" />
        <span className="text-xs font-medium uppercase tracking-wider text-stone/60">atau</span>
        <span className="h-px bg-stone/20 flex-1" />
      </div>

      <div className="space-y-4 bg-stone/5 p-6 rounded-xl border border-stone/10">
        <Input
          label="Sudah punya App Key?"
          placeholder="Tempel App Key di sini"
          value={manualKey}
          onChange={(e) => setManualKey(e.target.value)}
        />
        <Button type="button" variant="outline" className="w-full bg-white hover:bg-white" onClick={handleUseExistingKey}>
          Gunakan App Key Ini
        </Button>
      </div>
    </div>
  )
}
