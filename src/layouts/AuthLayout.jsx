import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-paper relative">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-sand/40 blur-3xl rounded-full -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-moss/5 blur-3xl rounded-full -z-10 pointer-events-none" />
      
      <div className="hidden md:flex flex-col justify-between bg-ink text-paper p-12 lg:p-16 relative overflow-hidden">
        {/* Subtle pattern or gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink to-forest/20 opacity-90" />
        
        <div className="relative z-10">
          <span className="font-display text-3xl font-semibold tracking-tight text-sand">Ruang Kerja.</span>
        </div>
        
        <div className="relative z-10 my-16">
          <h2 className="font-display text-4xl lg:text-5xl leading-[1.15] max-w-lg mb-6">
            Fokus, kolaborasi, dan berinovasi tanpa hambatan.
          </h2>
          <p className="text-sand/80 text-base max-w-sm leading-relaxed">
            Platform manajemen ruang kerja premium untuk profesional modern. Temukan ruang yang tepat untuk setiap kebutuhan Anda.
          </p>
        </div>
        
        <div className="relative z-10 flex items-center justify-between text-xs text-sand/60 border-t border-sand/10 pt-6">
          <span>© 2026 Ruang Kerja.</span>
          <span>Sistem Manajemen Terpadu</span>
        </div>
      </div>
      
      <div className="flex items-center justify-center p-6 sm:p-12 lg:p-16 w-full h-full">
        <div className="w-full max-w-md animate-fade-in bg-white/60 backdrop-blur-xl p-8 sm:p-10 rounded-2xl shadow-elevated border border-white/50">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
