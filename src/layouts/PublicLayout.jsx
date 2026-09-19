import { Outlet, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Button from '../components/ui/Button.jsx'

export default function PublicLayout() {
  const { isAuthenticated, role } = useAuth()
  
  const dashboardLink = role === 'admin_space' ? '/admin/dashboard' : '/member/dashboard'

  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans">
      <header className="sticky top-0 z-50 bg-white backdrop-blur-md border-b border-stone/10 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center">
  <img
    src="/workingspace.png"
    alt="WorkNest"
    className="h-28 w-32 object-contain transition-transform duration-200 hover:scale-[1.0]"
  />
</Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#spaces" className="text-black hover:text-ink transition-colors">Spaces</a>
            <a href="#features" className="text-black hover:text-ink transition-colors">Fasilitas</a>
            <a href="#how-it-works" className="text-black hover:text-ink transition-colors">Cara Kerja</a>
          </nav>
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link to={dashboardLink}>
                <Button variant="primary">Masuk Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-ink hover:text-forest transition-colors hidden sm:block">
                  Masuk
                </Link>
                <Link to="/register">
                  <Button variant="primary">Daftar Gratis</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-ink text-paper py-16 border-t border-stone/10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2 space-y-4">
            <span className="font-semibold mb-4 text-sand">Work Space</span>
            <p className="text-sand/70 max-w-sm text-sm leading-relaxed">
              Ekosistem ruang kerja premium untuk startup, freelancer, dan perusahaan modern. Fleksibel, nyaman, dan mendukung produktivitas penuh.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-sand">Navigasi</h4>
            <ul className="space-y-3 text-sm text-sand/70">
              <li><a href="#spaces" className="hover:text-white transition-colors">Lihat Spaces</a></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Buat Akun Member</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Daftarkan Coworking</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-sand">Kontak</h4>
            <ul className="space-y-3 text-sm text-sand/70">
              <li>suryaputrahadi29@gmail.com</li>
              <li>0838 5764 2962</li>
              <li>Jl. Cafe Malang</li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto px-6 mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-sand/50">
          <p>© 2026 Ruang Kerja. Hak cipta dilindungi undang-undang.</p>
          <p className="mt-2 md:mt-0">Dibuat untuk UKK RPL SMK Telkom Malang</p>
        </div>
      </footer>
    </div>
  )
}
