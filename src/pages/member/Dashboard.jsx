import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { getMyReservasi, getMyReservasiHistory } from '../../api/reservasi.js'
import { getSpaces } from '../../api/spaces.js'
import { unwrap, getErrorMessage } from '../../api/axios.js'
import Card from '../../components/ui/Card.jsx'
import Loading from '../../components/common/Loading.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import StatusBadge from '../../components/ui/Badge.jsx'
import { formatDateDisplay } from '../../utils/date.js'
import { getImageUrl } from '../../utils/image.js'

export default function MemberDashboard() {
  const { user } = useAuth()
  const [state, setState] = useState({ loading: true, error: null, reservasiAktif: [], history: [], spaces: [] })

  const loadData = async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const [aktifRes, historyRes, spacesRes] = await Promise.all([
        getMyReservasi(),
        getMyReservasiHistory(),
        getSpaces(),
      ])
      setState({
        loading: false,
        error: null,
        reservasiAktif: unwrap(aktifRes).data ?? [],
        history: unwrap(historyRes).data ?? [],
        spaces: unwrap(spacesRes).data ?? [],
      })
    } catch (error) {
      setState((s) => ({ ...s, loading: false, error: getErrorMessage(error) }))
    }
  }

  useEffect(() => { loadData() }, [])

  if (state.loading) return <Loading />
  if (state.error) return <ErrorState message={state.error} onRetry={loadData} />

  const upcoming = (Array.isArray(state.reservasiAktif) ? state.reservasiAktif : []).filter((r) =>
    ['belum_dikonfirm', 'disetujui', 'aktif'].includes(r.status)
  )

  const spacesArr = Array.isArray(state.spaces) ? state.spaces : []

  // Function to get appropriate greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Selamat pagi'
    if (hour < 15) return 'Selamat siang'
    if (hour < 18) return 'Selamat sore'
    return 'Selamat malam'
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-semibold text-ink mb-1 tracking-tight">
            {getGreeting()}, {user?.nama_member?.split(' ')[0] || user?.username || 'Member'} 👋
          </h2>
          <p className="text-stone">Mari tingkatkan produktivitas Anda hari ini.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-clay/10 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
          <div className="relative z-10">
            <p className="text-sm font-medium text-stone mb-2">Reservasi Aktif</p>
            <p className="font-display text-4xl font-semibold text-ink">{upcoming.length}</p>
          </div>
        </Card>
        <Card className="p-6 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-forest/10 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
          <div className="relative z-10">
            <p className="text-sm font-medium text-stone mb-2">Space Tersedia</p>
            <p className="font-display text-4xl font-semibold text-ink">{spacesArr.length}</p>
          </div>
        </Card>
      </div>

      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display text-xl font-semibold text-ink">Jadwal Mendatang</h3>
            <p className="text-sm text-stone mt-1">Reservasi yang akan datang dan sedang berjalan</p>
          </div>
          <Link to="/member/reservasi" className="text-sm font-medium text-forest hover:text-moss hidden sm:block">
            Lihat semua
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <EmptyState
            title="Belum ada jadwal"
            description="Anda belum memiliki reservasi yang aktif atau akan datang. Jelajahi space dan mulai booking."
            action={
              <Link to="/member/spaces">
                <span className="inline-block mt-2 px-5 py-2.5 bg-ink text-paper rounded-md text-sm font-medium hover:bg-forest transition-colors">
                  Cari Space
                </span>
              </Link>
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcoming.slice(0, 3).map((r) => (
              <Link key={r.id} to={`/member/reservasi/${r.id}`} className="block group">
                <Card hover className="p-0 h-full overflow-hidden flex flex-col border-stone/10 bg-white group-hover:border-forest/30">
                  <div className="p-5 flex-1">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <StatusBadge status={r.status} />
                      <div className="p-2 bg-sand/30 rounded-full text-stone group-hover:text-forest group-hover:bg-forest/10 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </div>
                    </div>

                    <h4 className="font-display text-lg font-semibold text-ink mb-1 line-clamp-1">
                      {r.detail_reservasi?.[0]?.space?.nama_space || r.space_nama || r.nama_space || 'Space'}
                    </h4>
                    <p className="text-sm text-stone flex items-center gap-2 mt-3">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {formatDateDisplay(r.tanggal_reservasi)}
                    </p>
                    <p className="text-sm text-stone flex items-center gap-2 mt-1.5">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {r.jam_mulai}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Suggested Spaces Section */}
      {spacesArr.length > 0 && (
        <section className="pt-8 border-t border-stone/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display text-xl font-semibold text-ink">Mungkin Anda Suka</h3>
              <p className="text-sm text-stone mt-1">Rekomendasi space yang tersedia</p>
            </div>
            <Link to="/member/spaces" className="text-sm font-medium text-forest hover:text-moss hidden sm:block">
              Lihat semua
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {spacesArr.slice(0, 4).map(space => (
              <Link key={space.id} to={`/member/spaces/${space.id}`} className="group block h-full">
                <Card hover className="h-full overflow-hidden">
                  <div className="h-32 bg-sand overflow-hidden">
                    {space.foto ? (
                      <img src={getImageUrl(space.foto, 'spaces')} alt={space.nama_space} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone text-xs">Ruang Kerja</div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-display font-medium text-ink line-clamp-1">{space.nama_space}</p>
                    <p className="text-xs text-stone capitalize mt-1">{space.tipe?.replace('_', ' ')}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
