import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutGrid,
  Building2,
  CalendarClock,
  History,
  User,
  LogOut,
} from 'lucide-react'

import Sidebar from '../components/common/Sidebar.jsx'
import Navbar from '../components/common/Navbar.jsx'

const NAV_ITEMS = [
  { to: '/member/dashboard', label: 'Dashboard', icon: <LayoutGrid size={18} />, end: true },
  { to: '/member/spaces', label: 'Space', icon: <Building2 size={18} /> },
  { to: '/member/reservasi', label: 'Reservasi Saya', icon: <CalendarClock size={18} /> },
  { to: '/member/history', label: 'Histori', icon: <History size={18} /> },
  { to: '/member/profile', label: 'Profile', icon: <User size={18} /> },
]

const TITLES = {
  '/member/dashboard': 'Dashboard Member',
  '/member/spaces': 'Jelajah Space',
  '/member/reservasi': 'Reservasi Aktif',
  '/member/history': 'Histori Reservasi',
  '/member/profile': 'Profile Saya',
}

export default function MemberLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('coworking_access_token')
    localStorage.removeItem('coworking_user')
    navigate('/login')
  }

  const sidebarFooter = (
    <button
      onClick={handleLogout}
      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-stone transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
    >
      <LogOut size={18} />
      <span>Logout</span>
    </button>
  )

  const matchingKey = Object.keys(TITLES)
    .filter((path) => location.pathname.startsWith(path))
    .sort((a, b) => b.length - a.length)[0]

  const title = matchingKey ? TITLES[matchingKey] : 'Ruang Kerja'

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar
        items={NAV_ITEMS}
        footer={sidebarFooter}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <Navbar
          title={title}
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}