import { useAuth } from '../../context/AuthContext.jsx'
import { Menu } from 'lucide-react'
import Button from '../ui/Button.jsx'

export default function Navbar({ title, onMenuClick }) {
  const { user, logout } = useAuth()

  return (
    <header className="h-16 border-b border-stone/10 bg-white flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-1.5 -ml-1.5 text-stone hover:text-ink rounded-md hover:bg-sand/50 transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="font-display text-lg font-medium text-ink hidden sm:block">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-sand/30 border border-stone/10">
          <div className="w-6 h-6 rounded-full bg-forest text-white flex items-center justify-center text-xs font-medium">
            {(user?.nama_member || user?.nama_pemilik || user?.username || 'U').charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-ink hidden sm:block pr-1">
            {user?.nama_member || user?.nama_pemilik || user?.username || 'Pengguna'}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="hidden sm:inline-flex"
        >
          Keluar
        </Button>
      </div>
    </header>
  )
}
