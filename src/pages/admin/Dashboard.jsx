import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { getAdminReservasi as getReservasi } from '../../api/reservasi.js'
import { getSpaces } from '../../api/spaces.js'
import { getMembersList as getMembers } from '../../api/members.js'
import { unwrap, getErrorMessage } from '../../api/axios.js'
import Card from '../../components/ui/Card.jsx'
import Loading from '../../components/common/Loading.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'
import StatusBadge from '../../components/ui/Badge.jsx'
import { formatRupiah } from '../../utils/currency.js'
import { formatDateDisplay } from '../../utils/date.js'
import { normalizeReservasi } from '../../utils/reservasi.js'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [state, setState] = useState({ loading: true, error: null, reservasi: [], spaces: [], members: [] })

  const loadData = async () => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const [resReq, spaceReq, memberReq] = await Promise.all([
        getReservasi({ limit: 10 }), // get recent 10
        getSpaces(),
        getMembers()
      ])

      let rawRes = unwrap(resReq).data
      if (rawRes && !Array.isArray(rawRes)) {
        if (Array.isArray(rawRes.data)) rawRes = rawRes.data
        else if (Array.isArray(rawRes.reservasi)) rawRes = rawRes.reservasi
        else {
          const arr = Object.values(rawRes).find(v => Array.isArray(v))
          rawRes = arr || []
        }
      }

      setState({
        loading: false,
        error: null,
        reservasi: (Array.isArray(rawRes) ? rawRes : []).map(normalizeReservasi),
        spaces: unwrap(spaceReq).data ?? [],
        members: unwrap(memberReq).data ?? [],
      })
    } catch (err) {
      setState(s => ({ ...s, loading: false, error: getErrorMessage(err) }))
    }
  }

  useEffect(() => { loadData() }, [])

  if (state.loading) return <Loading />
  if (state.error) return <ErrorState message={state.error} onRetry={loadData} />

  const spacesArr = Array.isArray(state.spaces) ? state.spaces : []
  const membersArr = Array.isArray(state.members) ? state.members : []
  const activeReservasi = state.reservasi.filter(r => ['belum_dikonfirm', 'disetujui', 'aktif'].includes(r.status))
  const totalRevenue = state.reservasi
    .filter(r => ['disetujui', 'aktif', 'selesai'].includes(r.status))
    .reduce((sum, r) => sum + (Number(r.total_bayar) || 0), 0)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-3xl font-semibold text-ink mb-2 tracking-tight">
          Dashboard {user?.nama_coworking || 'Admin'}
        </h2>
        <p className="text-stone">Ringkasan performa coworking space Anda hari ini.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Reservasi Aktif', value: activeReservasi.length, icon: '📅', color: 'bg-forest' },
          { label: 'Total Pendapatan', value: formatRupiah(totalRevenue), icon: '💰', color: 'bg-clay' },
          { label: 'Space Terdaftar', value: spacesArr.length, icon: '🏢', color: 'bg-stone' },
          { label: 'Total Member', value: membersArr.length, icon: '👥', color: 'bg-ink' },
        ].map((kpi, i) => (
          <Card key={i} className="p-6 relative overflow-hidden group">
            <div className={`absolute -right-6 -top-6 w-24 h-24 ${kpi.color}/10 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out`} />
            <div className="relative z-10">
              <div className="text-2xl mb-3">{kpi.icon}</div>
              <p className="text-sm font-medium text-stone mb-1">{kpi.label}</p>
              <p className="font-display text-2xl font-semibold text-ink">{kpi.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-semibold text-ink">Reservasi Terbaru</h3>
            <Link to="/admin/reservasi" className="text-sm font-medium text-forest hover:text-moss">
              Lihat Semua
            </Link>
          </div>

          <Card className="p-0 border-stone/10 overflow-hidden">
            {state.reservasi.length === 0 ? (
              <div className="p-8 text-center text-stone text-sm">Belum ada reservasi.</div>
            ) : (
              <div className="divide-y divide-stone/10">
                {state.reservasi.slice(0, 5).map(r => (
                  <div key={r.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone/5 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-sand/50 flex items-center justify-center text-stone font-medium shrink-0">
                        {(r.member?.nama_member || 'M').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-ink line-clamp-1">{r.nama_space || 'Space'}</p>
                        <p className="text-xs text-stone mt-1">{r.member?.nama_member || 'Member'}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-stone">
                          <span>{formatDateDisplay(r.tanggal_reservasi)}</span>
                          <span>{r.jam_mulai}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0">
                      <StatusBadge status={r.status} />
                      <span className="font-medium text-ink">{formatRupiah(r.total_bayar)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <h3 className="font-display text-xl font-semibold text-ink">Aksi Cepat</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <Link to="/admin/spaces/new">
              <Card hover className="p-5 flex items-center gap-4 bg-white border-stone/10 group">
                <div className="w-10 h-10 rounded-full bg-forest/10 text-forest flex items-center justify-center group-hover:bg-forest group-hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </div>
                <div className="font-medium text-ink">Tambah Space Baru</div>
              </Card>
            </Link>
            <Link to="/admin/diskon/new">
              <Card hover className="p-5 flex items-center gap-4 bg-white border-stone/10 group">
                <div className="w-10 h-10 rounded-full bg-clay/10 text-clay flex items-center justify-center group-hover:bg-clay group-hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                </div>
                <div className="font-medium text-ink">Buat Kode Diskon</div>
              </Card>
            </Link>
            <Link to="/admin/reports">
              <Card hover className="p-5 flex items-center gap-4 bg-white border-stone/10 group">
                <div className="w-10 h-10 rounded-full bg-stone/10 text-stone flex items-center justify-center group-hover:bg-stone group-hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div className="font-medium text-ink">Unduh Laporan</div>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
