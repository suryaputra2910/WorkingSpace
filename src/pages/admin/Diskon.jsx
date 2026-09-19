import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getDiskonList as getDiskon, deleteDiskon } from '../../api/diskon.js'
import { unwrap, getErrorMessage } from '../../api/axios.js'
import Table from '../../components/ui/Table.jsx'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import Loading from '../../components/common/Loading.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'
import ConfirmDialog from '../../components/modal/ConfirmDialog.jsx'

export default function Diskon() {
  const [diskonList, setDiskonList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showDelete, setShowDelete] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getDiskon()
      const raw = unwrap(res).data
      setDiskonList(Array.isArray(raw) ? raw : [])
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
      await deleteDiskon(selectedId)
      toast.success('Diskon berhasil dihapus')
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
      key: 'nama',
      header: 'Kode Diskon',
      render: d => <span className="font-mono text-ink font-semibold uppercase">{d.nama_diskon}</span>
    },
    {
      key: 'persentase',
      header: 'Potongan',
      render: d => (
        <span className="inline-flex px-2.5 py-1 bg-forest/10 text-forest rounded font-semibold">
          {d.persentase_diskon}%
        </span>
      )
    },
    {
      key: 'aksi',
      header: 'Aksi',
      render: (d) => (
        <div className="flex items-center gap-2">
          <Link to={`/admin/diskon/${d.id}`}>
            <Button size="sm" variant="ghost">Edit</Button>
          </Link>
          <Button size="sm" variant="ghost" className="text-brick hover:bg-brick/10" onClick={() => { setSelectedId(d.id); setShowDelete(true); }}>
            Hapus
          </Button>
        </div>
      )
    },
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-semibold text-ink mb-1">Kelola Diskon</h2>
          <p className="text-stone">Daftar kode promo yang dapat digunakan member.</p>
        </div>
        <Link to="/admin/diskon/new">
          <Button variant="primary">Buat Kode Diskon</Button>
        </Link>
      </div>

      <Card className="p-0 border-stone/10">
        <Table columns={columns} data={diskonList} emptyMessage="Belum ada kode diskon." />
      </Card>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        danger
        title="Hapus Diskon"
        description="Apakah Anda yakin ingin menghapus kode diskon ini? Member tidak akan bisa menggunakannya lagi."
      />
    </div>
  )
}
