import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getCoworkingProfile, updateCoworkingProfile } from '../../api/admin.js'
import { unwrap, getErrorMessage } from '../../api/axios.js'
import Card from '../../components/ui/Card.jsx'
import Input from '../../components/ui/Input.jsx'
import Button from '../../components/ui/Button.jsx'
import Loading from '../../components/common/Loading.jsx'

export default function AdminProfile() {
  const [form, setForm] = useState({ nama_coworking: '', nama_pemilik: '', telp: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const res = await getCoworkingProfile()
      const data = unwrap(res).data
      if (data) {
        setForm({
          nama_coworking: data.nama_coworking || '',
          nama_pemilik: data.nama_pemilik || '',
          telp: data.telp || '',
        })
      }
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateCoworkingProfile(form)
      toast.success('Profile coworking berhasil diperbarui')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-3xl font-semibold text-ink mb-2">Profile Coworking</h2>
        <p className="text-stone">Atur informasi dasar bisnis coworking space Anda.</p>
      </div>

      <Card className="p-0 border-stone/10 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-6 sm:p-8 space-y-6">
            <Input label="Nama Coworking Space" name="nama_coworking" value={form.nama_coworking} onChange={handleChange} required />
            <Input label="Nama Pemilik / Penanggung Jawab" name="nama_pemilik" value={form.nama_pemilik} onChange={handleChange} required />
            <Input label="Nomor Telepon" name="telp" type="tel" value={form.telp} onChange={handleChange} required />
          </div>
          <div className="bg-stone/5 p-6 sm:p-8 flex justify-end border-t border-stone/10">
            <Button type="submit" isLoading={saving} size="lg" className="w-full sm:w-auto px-8">
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
