import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../../context/AuthContext.jsx'
import { registerMember, registerAdminSpace } from '../../api/auth.js'
import Input from '../../components/ui/Input.jsx'
import Button from '../../components/ui/Button.jsx'
import { runValidation, required, minLength } from '../../utils/validation.js'

const TABS = [
  { key: 'member', label: 'Member Baru' },
]

const INITIAL_MEMBER = { username: '', password: '', nama_member: '', instansi: '', alamat: '', telp: '' }
const INITIAL_ADMIN = { username: '', password: '', nama_coworking: '', nama_pemilik: '', telp: '' }

export default function RegisterPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('member')
  const [memberForm, setMemberForm] = useState(INITIAL_MEMBER)
  const [adminForm, setAdminForm] = useState(INITIAL_ADMIN)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const form = tab === 'member' ? memberForm : adminForm
  const setForm = tab === 'member' ? setMemberForm : setAdminForm

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const commonRules = {
      username: [(v) => required(v, 'Username')],
      password: [(v) => required(v, 'Password'), (v) => minLength(v, 6, 'Password')],
      telp: [(v) => required(v, 'Telepon')],
    }
    const rules = tab === 'member'
      ? {
        ...commonRules,
        nama_member: [(v) => required(v, 'Nama')],
        instansi: [(v) => required(v, 'Instansi')],
        alamat: [(v) => required(v, 'Alamat')]
      }
      : {
        ...commonRules,
        nama_coworking: [(v) => required(v, 'Nama coworking')],
        nama_pemilik: [(v) => required(v, 'Nama pemilik')]
      }

    const validationErrors = runValidation(form, rules)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setIsLoading(true)
    try {
      if (tab === 'member') {
        await registerMember(form)
      } else {
        await registerAdminSpace(form)
      }
      toast.success('Registrasi berhasil, silakan login')
      navigate('/login')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-8 text-center sm:text-left">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-ink mb-2">Buat Akun Baru</h2>
        <p className="text-sm text-stone leading-relaxed">
          Pilih tipe akun Anda dan lengkapi data diri di bawah ini.
        </p>
      </div>

      <div className="flex p-1 bg-stone/5 border border-stone/10 rounded-lg mb-8">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => { setTab(t.key); setErrors({}) }}
            className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200 ${tab === t.key
                ? 'bg-white text-ink shadow-soft'
                : 'text-stone hover:text-ink'
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Username" name="username" value={form.username} onChange={handleChange} error={errors.username} />
          <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} />
        </div>

        {tab === 'member' ? (
          <>
            <Input label="Nama Lengkap" name="nama_member" value={memberForm.nama_member} onChange={handleChange} error={errors.nama_member} />
            <Input label="Instansi / Perusahaan" name="instansi" value={memberForm.instansi} onChange={handleChange} error={errors.instansi} />
            <Input label="Alamat Lengkap" name="alamat" value={memberForm.alamat} onChange={handleChange} error={errors.alamat} />
            <Input label="Nomor Telepon" name="telp" type="tel" value={memberForm.telp} onChange={handleChange} error={errors.telp} />
          </>
        ) : (
          <>
            <Input label="Nama Coworking Space" name="nama_coworking" value={adminForm.nama_coworking} onChange={handleChange} error={errors.nama_coworking} />
            <Input label="Nama Pemilik" name="nama_pemilik" value={adminForm.nama_pemilik} onChange={handleChange} error={errors.nama_pemilik} />
            <Input label="Nomor Telepon" name="telp" type="tel" value={adminForm.telp} onChange={handleChange} error={errors.telp} />
          </>
        )}

        <div className="pt-4">
          <Button type="submit" className="w-full text-base py-3" size="lg" isLoading={isLoading}>
            Daftar Sekarang
          </Button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-stone/10 text-center sm:text-left">
        <p className="text-sm text-stone">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-forest font-medium hover:text-moss transition-colors">Masuk</Link>
        </p>
      </div>
    </div>
  )
}
