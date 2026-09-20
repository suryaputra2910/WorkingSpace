import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getDiskonById, createDiskon, updateDiskon } from '../../api/diskon.js'
import { unwrap, getErrorMessage } from '../../api/axios.js'
import Card from '../../components/ui/Card.jsx'
import Input from '../../components/ui/Input.jsx'
import Button from '../../components/ui/Button.jsx'
import Loading from '../../components/common/Loading.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'

export default function DiskonDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'

  const [form, setForm] = useState({
    nama_diskon: '',
    persentase_diskon: '',
    tanggal_awal: '',
    tanggal_akhir: '',
  })

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const load = async () => {
    if (isNew) return

    try {
      const res = await getDiskonById(id)
      const data = unwrap(res).data

      if (data) {
        setForm({
          nama_diskon: data.nama_diskon || '',
          persentase_diskon: data.persentase_diskon || '',
          tanggal_awal: data.tanggal_awal
            ? data.tanggal_awal.slice(0, 10)
            : '',
          tanggal_akhir: data.tanggal_akhir
            ? data.tanggal_akhir.slice(0, 10)
            : '',
        })
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.tanggal_awal || !form.tanggal_akhir) {
      toast.error('Tanggal awal dan tanggal akhir wajib diisi')
      return
    }

    if (form.tanggal_akhir < form.tanggal_awal) {
      toast.error('Tanggal akhir tidak boleh sebelum tanggal awal')
      return
    }

    setSaving(true)

    try {
      const payload = {
        nama_diskon: form.nama_diskon.trim().toUpperCase(),
        persentase_diskon: Number(form.persentase_diskon),
        tanggal_awal: new Date(
          `${form.tanggal_awal}T00:00:00`
        ).toISOString(),
        tanggal_akhir: new Date(
          `${form.tanggal_akhir}T23:59:59`
        ).toISOString(),
      }

      if (isNew) {
        await createDiskon(payload)
        toast.success('Diskon berhasil ditambahkan')
      } else {
        await updateDiskon(id, payload)
        toast.success('Diskon berhasil diperbarui')
      }

      navigate('/admin/diskon')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading />

  if (error) {
    return <ErrorState message={error} onRetry={load} />
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-stone/10 text-stone transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>

        <h2 className="font-display text-2xl font-semibold text-ink">
          {isNew ? 'Buat Kode Diskon' : 'Edit Diskon'}
        </h2>
      </div>

      <Card className="p-0 border-stone/10 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-6 sm:p-8 space-y-6">
            <Input
              label="Kode Diskon"
              name="nama_diskon"
              value={form.nama_diskon}
              onChange={handleChange}
              placeholder="Contoh: PROMO2026"
              className="uppercase font-mono"
              required
            />

            <Input
              label="Persentase Diskon (%)"
              name="persentase_diskon"
              type="number"
              min={1}
              max={100}
              value={form.persentase_diskon}
              onChange={handleChange}
              required
            />

            <Input
              label="Tanggal Awal"
              name="tanggal_awal"
              type="date"
              value={form.tanggal_awal}
              onChange={handleChange}
              required
            />

            <Input
              label="Tanggal Akhir"
              name="tanggal_akhir"
              type="date"
              value={form.tanggal_akhir}
              onChange={handleChange}
              required
            />
          </div>

          <div className="bg-stone/5 p-6 sm:p-8 flex justify-end gap-3 border-t border-stone/10">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(-1)}
            >
              Batal
            </Button>

            <Button type="submit" isLoading={saving}>
              Simpan Diskon
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}