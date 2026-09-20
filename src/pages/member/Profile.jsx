import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { getProfile } from '../../api/auth.js'
import { unwrap, getErrorMessage } from '../../api/axios.js'

import Card from '../../components/ui/Card.jsx'
import Input from '../../components/ui/Input.jsx'
import Loading from '../../components/common/Loading.jsx'
import Avatar from '../../components/common/Avatar.jsx'
import { normalizeProfile } from '../../utils/profile.js'

export default function MemberProfile() {
  const [form, setForm] = useState({
    nama_member: '',
    username: '',
    instansi: '',
    alamat: '',
    telp: '',
    foto_profil: '',
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // GET /api/auth/profile -> the member that is currently logged in.
        const res = await getProfile()
        const p = normalizeProfile(unwrap(res).data)

        setForm({
          nama_member: p.nama,
          username: p.username,
          instansi: p.instansi,
          alamat: p.alamat,
          telp: p.telp,
          foto_profil: p.foto,
        })
      } catch (err) {
        toast.error(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  if (loading) {
    return <Loading />
  }

  const displayName = form.nama_member || form.username || ''

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-3xl font-semibold text-ink mb-2">
          Profile Saya
        </h2>

        <p className="text-stone">
          Informasi profil akun yang sedang login.
        </p>
      </div>

      <Card className="p-0 border-stone/10 overflow-hidden">
        <div className="p-6 sm:p-8 space-y-8">

          {/* Foto & Nama Member */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="shrink-0">
              <Avatar
                foto={form.foto_profil}
                name={displayName}
                type="members"
                className="w-24 h-24 border-4 border-white shadow-soft"
                textClassName="text-3xl font-display"
              />
            </div>

            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-xl">
                {displayName}
              </h3>

              <p className="text-sm text-stone mt-1">
                Profile Anda
              </p>
            </div>
          </div>

          {/* Informasi */}
          <div className="border-t border-stone/10 pt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">

            <Input
              label="Nama Lengkap"
              name="nama_member"
              value={form.nama_member}
              readOnly
              className="bg-stone/5 text-stone cursor-not-allowed"
            />

            <Input
              label="Nomor Telepon"
              name="telp"
              type="tel"
              value={form.telp}
              readOnly
              className="bg-stone/5 text-stone cursor-not-allowed"
            />

            <div className="sm:col-span-2">
              <Input
                label="Instansi / Perusahaan"
                name="instansi"
                value={form.instansi}
                readOnly
                className="bg-stone/5 text-stone cursor-not-allowed"
              />
            </div>

            <div className="sm:col-span-2">
              <Input
                label="Alamat Lengkap"
                name="alamat"
                value={form.alamat}
                readOnly
                className="bg-stone/5 text-stone cursor-not-allowed"
              />
            </div>

          </div>
        </div>

        <div className="border-t border-stone/10 bg-stone/5 px-6 py-4 sm:px-8">
          <p className="text-sm text-stone">
            Data diambil dari akun yang sedang login dan hanya dapat dilihat.
          </p>
        </div>
      </Card>
    </div>
  )
}