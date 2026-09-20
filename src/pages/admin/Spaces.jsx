import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getSpaces, deleteSpace } from '../../api/spaces.js'
import { unwrap, getErrorMessage } from '../../api/axios.js'
import Table from '../../components/ui/Table.jsx'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import Loading from '../../components/common/Loading.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'
import ConfirmDialog from '../../components/modal/ConfirmDialog.jsx'
import { formatRupiah } from '../../utils/currency.js'
import SpaceImage from '../../components/common/SpaceImage.jsx'

export default function Spaces() {
  const [spaces, setSpaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showDelete, setShowDelete] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getSpaces()
      const raw = unwrap(res).data
      setSpaces(Array.isArray(raw) ? raw : [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteSpace(selectedId)
      toast.success('Space berhasil dihapus')
      load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsDeleting(false)
      setShowDelete(false)
      setSelectedId(null)
    }
  }

  if (loading) return <Loading />
  if (error) return <ErrorState message={error} onRetry={load} />

  const columns = [
    {
      key: 'space',
      header: 'Space',
      render: (s) => (
        <div className="flex items-center gap-4 py-1">
          <div className="w-12 h-12 rounded-md bg-sand overflow-hidden shrink-0">
            <SpaceImage
              space={s}
              fallback={<div className="w-full h-full flex items-center justify-center text-stone text-[10px] font-medium">No Image</div>}
            />
          </div>
          <div>
            <div className="font-medium text-ink">{s.nama_space}</div>
            <div className="text-xs text-stone mt-0.5 uppercase tracking-wider">{s.tipe?.replace('_', ' ')}</div>
          </div>
        </div>
      )
    },
    { key: 'kapasitas', header: 'Kapasitas', render: s => `${s.kapasitas} org` },
    { key: 'harga', header: 'Harga / Jam', render: s => <span className="font-medium text-clay">{formatRupiah(s.harga_per_jam)}</span> },
    {
      key: 'aksi',
      header: 'Aksi',
      render: (s) => (
        <div className="flex items-center gap-2">
          <Link to={`/admin/spaces/${s.id}`}>
            <Button size="sm" variant="ghost">Edit</Button>
          </Link>
          <Button size="sm" variant="ghost" className="text-brick hover:bg-brick/10" onClick={() => { setSelectedId(s.id); setShowDelete(true); }}>
            Hapus
          </Button>
        </div>
      )
    },
  ]

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-semibold text-ink mb-1">Kelola Space</h2>
          <p className="text-stone">Daftar ruangan yang tersedia di coworking Anda.</p>
        </div>
        <Link to="/admin/spaces/new">
          <Button variant="primary">Tambah Space Baru</Button>
        </Link>
      </div>

      <Card className="p-0 border-stone/10">
        <Table columns={columns} data={spaces} emptyMessage="Belum ada data space." />
      </Card>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        danger
        title="Hapus Space"
        description="Apakah Anda yakin ingin menghapus space ini? Data terkait mungkin ikut terhapus atau tidak dapat diakses."
      />
    </div>
  )
}
