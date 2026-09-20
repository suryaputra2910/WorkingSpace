import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getMembersList as getMembers, deleteMemberAdmin as deleteMember } from '../../api/members.js'
import { unwrap, getErrorMessage } from '../../api/axios.js'
import Table from '../../components/ui/Table.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Card from '../../components/ui/Card.jsx'
import Loading from '../../components/common/Loading.jsx'
import Avatar from '../../components/common/Avatar.jsx'
import { normalizeMember } from '../../utils/profile.js'
import { extractList } from '../../utils/reservasi.js'
import ErrorState from '../../components/common/ErrorState.jsx'
import ConfirmDialog from '../../components/modal/ConfirmDialog.jsx'

export default function Members() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  const [showDelete, setShowDelete] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getMembers()
      // Foto field is read from the real response (foto / nested member.foto).
      setMembers(extractList(unwrap(res).data).map(normalizeMember).filter(Boolean))
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
      await deleteMember(selectedId)
      toast.success('Member berhasil dihapus')
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

  const filtered = members.filter(m =>
    m.nama_member?.toLowerCase().includes(search.toLowerCase()) ||
    m.username?.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    {
      key: 'member',
      header: 'Informasi Member',
      render: (m) => (
        <div className="flex items-center gap-3">
          <Avatar foto={m.foto} name={m.nama_member || m.username} type="members" className="w-9 h-9 text-xs" />
          <div>
            <div className="font-medium text-ink">{m.nama_member}</div>
            <div className="text-xs text-stone mt-0.5">@{m.username}</div>
          </div>
        </div>
      )
    },
    { key: 'telp', header: 'Telepon', render: m => m.telp || '-' },
    { key: 'instansi', header: 'Instansi', render: m => m.instansi || '-' },
    {
      key: 'aksi',
      header: 'Aksi',
      render: (m) => (
        <div className="flex items-center gap-2">
          <Link to={`/admin/members/${m.id}`}>
            <Button size="sm" variant="ghost">Edit</Button>
          </Link>
          <Button size="sm" variant="ghost" className="text-brick hover:bg-brick/10" onClick={() => { setSelectedId(m.id); setShowDelete(true); }}>
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
          <h2 className="font-display text-3xl font-semibold text-ink mb-1">Kelola Member</h2>
          <p className="text-stone">Daftar pengguna yang terdaftar di coworking space Anda.</p>
        </div>
        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="flex-1 sm:w-64">
            <Input
              placeholder="Cari nama atau username..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Link to="/admin/members/new">
            <Button variant="primary" className="whitespace-nowrap">Tambah Member</Button>
          </Link>
        </div>
      </div>

      <Card className="p-0 border-stone/10">
        <Table columns={columns} data={filtered} />
      </Card>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        danger
        title="Hapus Member"
        description="Apakah Anda yakin ingin menghapus member ini? Tindakan ini tidak dapat diurungkan."
      />
    </div>
  )
}
