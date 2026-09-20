import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getSpaceById, createSpace, updateSpace } from '../../api/spaces.js'
import { unwrap, getErrorMessage } from '../../api/axios.js'
import Card from '../../components/ui/Card.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'
import Button from '../../components/ui/Button.jsx'
import Loading from '../../components/common/Loading.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'
import PhotoPicker from '../../components/ui/PhotoPicker.jsx'
import { pickSpacePhoto } from '../../utils/image.js'

export default function SpaceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'
  // A file that was already uploaded successfully is remembered so that a retry
  // after a failed save does not upload the same photo twice.

  const [form, setForm] = useState({ nama_space: '', deskripsi: '', tipe: 'meeting_room', kapasitas: '', harga_per_jam: '' })
  const [existingFoto, setExistingFoto] = useState('') // photo currently stored on the space
  const [newFile, setNewFile] = useState(null)         // File chosen but not uploaded yet
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const load = async () => {
    if (isNew) return
    try {
      const res = await getSpaceById(id)
      const data = unwrap(res).data
      if (data) {
        setForm({
          nama_space: data.nama_space || '',
          deskripsi: data.deskripsi || '',
          tipe: data.tipe || 'meeting_room',
          kapasitas: data.kapasitas ?? '',
          harga_per_jam: data.harga_per_jam ?? '',
        })
        setExistingFoto(pickSpacePhoto(data))
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
    const payload = {
      nama_space: form.nama_space,
      deskripsi: form.deskripsi,
      tipe: form.tipe,
      kapasitas: Number(form.kapasitas),
      harga_per_jam: Number(form.harga_per_jam),
    }

    // Endpoint /api/admin/spaces menerima foto sebagai File
    if (newFile instanceof File) {
      payload.foto = newFile
    }

    console.log('SPACE PAYLOAD:', payload)

    if (isNew) {
      const createRes = await createSpace(payload)

      console.log('CREATE SPACE RESPONSE:', createRes)

      toast.success('Space berhasil ditambahkan')
    } else {
      const updateRes = await updateSpace(id, payload)

      console.log('UPDATE SPACE RESPONSE:', updateRes)

      toast.success('Space berhasil diperbarui')
    }

    navigate('/admin/spaces')
  } catch (err) {
    console.error('SAVE SPACE ERROR:', err)
    toast.error(getErrorMessage(err))
  } finally {
    setSaving(false)
  }
}
  if (loading) return <Loading />
  if (error) return <ErrorState message={error} onRetry={load} />

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-stone/10 text-stone transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <h2 className="font-display text-2xl font-semibold text-ink">
          {isNew ? 'Tambah Space Baru' : 'Edit Space'}
        </h2>
      </div>

      <Card className="p-0 border-stone/10 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-6 sm:p-8 space-y-8">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-ink">Foto Utama</label>
              <PhotoPicker
                type="spaces"
                variant="wide"
                name={form.nama_space}
                currentFoto={existingFoto}
                file={newFile}
                onChange={setNewFile}
                disabled={saving}
              />
            </div>

            <div className="border-t border-stone/10 pt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <Input label="Nama Space" name="nama_space" value={form.nama_space} onChange={handleChange} required />
              </div>
              <Select
                label="Tipe Ruangan"
                name="tipe"
                value={form.tipe}
                onChange={handleChange}
                options={[
                  { value: 'private_office', label: 'Private Office' },
                  { value: 'meeting_room', label: 'Meeting Room' },
                  { value: 'desk', label: 'Desk' },
                ]}
              />
              <Input label="Kapasitas (Orang)" name="kapasitas" type="number" min={1} value={form.kapasitas} onChange={handleChange} required />
              <div className="sm:col-span-2">
                <Input label="Harga per Jam (Rp)" name="harga_per_jam" type="number" min={0} value={form.harga_per_jam} onChange={handleChange} required />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-ink mb-1.5">Deskripsi Lengkap</label>
                <textarea
                  name="deskripsi"
                  rows="4"
                  className="w-full border border-stone/25 rounded-md px-3.5 py-2.5 text-sm bg-white placeholder:text-stone/50 transition-colors focus:outline-none focus:ring-2 focus:ring-moss/20 focus:border-moss"
                  value={form.deskripsi}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="bg-stone/5 p-6 sm:p-8 flex justify-end gap-3 border-t border-stone/10">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Batal</Button>
            <Button type="submit" isLoading={saving}>Simpan Data</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
