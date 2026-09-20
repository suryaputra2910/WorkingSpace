import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSpaces } from '../../api/spaces.js'
import { unwrap } from '../../api/axios.js'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import SpaceImage from '../../components/common/SpaceImage.jsx'
import { formatRupiah } from '../../utils/currency.js'

export default function LandingPage() {
  const [spaces, setSpaces] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const res = await getSpaces()
        const raw = unwrap(res).data
        const arr = Array.isArray(raw) ? raw : []
        // Only show up to 3 featured spaces on landing
        setSpaces(arr.slice(0, 3))
      } catch (e) {
        // Silent fail for landing page
      } finally {
        setLoading(false)
      }
    }
    fetchSpaces()
  }, [])

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-paper py-24 sm:py-32 flex justify-center border-b border-stone/10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sand/40 blur-[100px] rounded-full -z-10" />

        <div className="max-w-4xl mx-auto px-6 text-center z-10 animate-slide-up">
          <h1 className="font-Sora text-5xl sm:text-7xl font-bold tracking-tight text-ink mb-8 leading-[1.1]">
            Ruang Kerja yang <span className="text-forest">Menginspirasi</span>
          </h1>
          <p className="text-lg sm:text-xl text-stone max-w-2xl mx-auto mb-12 leading-relaxed">
            Platform manajemen coworking space premium. Temukan desk privat, meeting room eksklusif, hingga ruang kantor lengkap untuk produktivitas tim Anda.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="#spaces">
              <Button size="lg" variant="primary" className="w-full sm:w-auto">Jelajahi Spaces ↓ </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/50 backdrop-blur-sm">Mulai Gratis</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Spaces */}
      <section id="spaces" className="py-24 px-6 bg-white flex justify-center">
        <div className="max-w-6xl w-full mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-2xl font-semibold text-ink mb-3">Space Pilihan</h2>
              <p className="text-stone">Kurasi ruang kerja terbaik untuk kebutuhan spesifik Anda.</p>
            </div>
            <Link to="/spaces" className="hidden sm:inline-block">
              <Button variant="ghost">Lihat Semua →</Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-80 bg-sand/30 rounded-xl animate-pulse" />
              ))
            ) : spaces.length > 0 ? (
              spaces.map(space => (
                <Link key={space.id} to="/login" className="group">
                  <Card hover className="h-full overflow-hidden border-stone/10 bg-paper/30 backdrop-blur-sm">
                    <div className="h-56 overflow-hidden relative bg-sand">
                      <SpaceImage
                        space={space}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        fallback={<div className="w-full h-full flex items-center justify-center text-stone font-medium">Ruang Kerja</div>}
                      />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-ink shadow-sm">
                        {space.tipe?.replace('_', ' ')}
                      </div>
                    </div>
                    <div className="p-6 space-y-2">
                      <h3 className="font-display text-xl font-semibold text-ink group-hover:text-forest transition-colors">{space.nama_space}</h3>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-sm text-stone flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>
                          Kapasitas {space.kapasitas} orang
                        </span>
                        <span className="font-semibold text-clay">{formatRupiah(space.harga_per_jam)}<span className="text-xs text-stone font-normal">/jam</span></span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-stone">Belum ada space tersedia.</div>
            )}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link to="/spaces">
              <Button variant="outline" className="w-full">Lihat Semua Space</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-ink text-paper flex justify-center">
        <div className="max-w-6xl w-full mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-semibold text-3xl text-center sm:text-4xl mb-6">Kenapa Memilih Kami?</h2>
            <p className="text-sand/70 text-center text-lg">Infrastruktur kelas enterprise untuk mendukung inovasi dan kolaborasi tanpa batas.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: 'Desain Premium',
                desc: 'Arsitektur modern dan ergonomis yang dirancang khusus untuk meningkatkan produktivitas dan fokus maksimal.',
                icon: '✨'
              },
              {
                title: 'Fasilitas Lengkap',
                desc: 'Internet kecepatan tinggi, kopi gratis, ruang meeting canggih, hingga area istirahat yang nyaman.',
                icon: '⚡'
              },
              {
                title: 'Manajemen Mudah',
                desc: 'Sistem booking instan, pembayaran fleksibel, dan manajemen tim dalam satu dashboard yang intuitif.',
                icon: '📱'
              }
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="text-4xl mb-6">{f.icon}</div>
                <h3 className="font-display text-xl font-semibold mb-3">{f.title}</h3>
                <p className="text-sand/60 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-paper flex justify-center">
        <div className="max-w-6xl w-full mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink mb-4">Mulai dalam 3 Langkah</h2>
            <p className="text-stone">Reservasi space favorit Anda tak pernah semudah ini.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-stone/20 -translate-y-1/2 z-0" />

            {[
              { step: '1', title: 'Daftar & Masuk', desc: 'Buat akun member atau daftarkan coworking Anda.' },
              { step: '2', title: 'Pilih Space dan Waktu', desc: 'Tentukan tempat, tanggal dan durasi reservasi secara real-time.' },
              { step: '3', title: 'Reservasi & Bayar', desc: 'Lakukan reservasi dan pembayaran.' }
            ].map((s, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center bg-paper px-6">
                <div className="w-16 h-16 rounded-full bg-forest text-white flex items-center justify-center font-display text-2xl font-bold mb-6 shadow-card">
                  {s.step}
                </div>
                <h3 className="font-display text-xl font-semibold text-ink mb-2">{s.title}</h3>
                <p className="text-stone text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-sand flex justify-center border-t border-stone/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl font-bold text-ink mb-6">Siap untuk Tingkatkan Produktivitas?</h2>
          <p className="text-stone text-lg mb-10 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan profesional lainnya yang telah menemukan ruang kerja ideal mereka.
          </p>
          <Link to="/register">
            <Button size="lg" variant="primary" className="shadow-elevated px-10">Daftar Sekarang — Gratis</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
