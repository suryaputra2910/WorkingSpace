import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getMemberById, createMemberAdmin, updateMemberAdmin } from '../../api/members.js'
import { unwrap, getErrorMessage } from '../../api/axios.js'
import Card from '../../components/ui/Card.jsx'
import Input from '../../components/ui/Input.jsx'
import Button from '../../components/ui/Button.jsx'
import PhotoPicker from '../../components/ui/PhotoPicker.jsx'
import Loading from '../../components/common/Loading.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'
import { normalizeMember } from '../../utils/profile.js'

export default function MemberDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'
  // Remembers a photo that was uploaded already, so retrying a failed save
  // does not upload the same file again.

  const [form, setForm] = useState({ username: '', password: '', nama_member: '', telp: '', instansi: '', alamat: '' })
  const [existingFoto, setExistingFoto] = useState('') // photo currently stored for this member
  const [newFile, setNewFile] = useState(null)         // File chosen but not uploaded yet
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const load = async () => {
    if (isNew) return
    try {
      const res = await getMemberById(id)
      const data = normalizeMember(unwrap(res).data)
      if (data) {
        setForm({
          username: data.username || '',
          password: '',
          nama_member: data.nama_member || '',
          telp: data.telp || '',
          instansi: data.instansi || '',
          alamat: data.alamat || '',
        })
        setExistingFoto(data.foto || '')
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

 const handleSubmit = async (e) => {
  e.preventDefault()
  setSaving(true)

  try {
    const payload = { ...form }

    if (!payload.password) {
      delete payload.password
    }

    // Kirim File langsung ke endpoint /api/admin/members
    if (newFile instanceof File) {
      payload.foto = newFile
    }

    if (isNew) {
      await createMemberAdmin(payload)
      toast.success('Member berhasil ditambahkan')
    } else {
      await updateMemberAdmin(id, payload)
      toast.success('Data member berhasil diperbarui')
    }

    navigate('/admin/members')
  } catch (err) {
    toast.error(getErrorMessage(err))
  } finally {
    setSaving(false)
  }
}

  if (loading) return <Loading />
  if (error) return <ErrorState message={error} onRetry={load} />

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-stone/10 text-stone transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <h2 className="font-display text-2xl font-semibold text-ink">{isNew ? 'Tambah Member' : 'Edit Data Member'}</h2>
      </div>

      <Card className="p-0 border-stone/10 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-ink">Foto Member</label>
              <PhotoPicker
                type="members"
                variant="round"
                name={form.nama_member || form.username}
                currentFoto={existingFoto}
                file={newFile}
                onChange={setNewFile}
                disabled={saving}
              />
            </div>
            <div className="border-t border-stone/10 my-4" />
            <Input label="Username" name="username" value={form.username} onChange={handleChange} required />
            <Input
              label={isNew ? 'Password' : 'Password Baru'}
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required={isNew}
              helper={isNew ? undefined : 'Kosongkan jika tidak ingin mengubah password.'}
            />
            <div className="border-t border-stone/10 my-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input label="Nama Lengkap" name="nama_member" value={form.nama_member} onChange={handleChange} required />
              <Input label="Telepon" name="telp" type="tel" value={form.telp} onChange={handleChange} required />
              <div className="sm:col-span-2">
                <Input label="Instansi" name="instansi" value={form.instansi} onChange={handleChange} />
              </div>
              <div className="sm:col-span-2">
                <Input label="Alamat" name="alamat" value={form.alamat} onChange={handleChange} />
              </div>
            </div>
          </div>
          <div className="bg-stone/5 p-6 sm:p-8 flex justify-end gap-3 border-t border-stone/10">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Batal</Button>
            <Button type="submit" isLoading={saving}>{isNew ? 'Tambah Member' : 'Simpan Perubahan'}</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
