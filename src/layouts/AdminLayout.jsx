import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { LayoutGrid, Building2, Users, Tag, CalendarClock, BarChart3, Settings } from 'lucide-react'
import Sidebar from '../components/common/Sidebar.jsx'
import Navbar from '../components/common/Navbar.jsx'

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutGrid size={18} />, end: true },
  { to: '/admin/profile', label: 'Profile Coworking', icon: <Settings size={18} /> },
  { to: '/admin/members', label: 'Members', icon: <Users size={18} /> },
  { to: '/admin/spaces', label: 'Spaces', icon: <Building2 size={18} /> },
  { to: '/admin/diskon', label: 'Diskon', icon: <Tag size={18} /> },
  { to: '/admin/reservasi', label: 'Reservasi', icon: <CalendarClock size={18} /> },
  { to: '/admin/reports', label: 'Laporan', icon: <BarChart3 size={18} /> },
]

const TITLES = {
  '/admin/dashboard': 'Dashboard Admin',
  '/admin/profile': 'Profile Coworking',
  '/admin/members': 'Kelola Member',
  '/admin/spaces': 'Kelola Space',
  '/admin/diskon': 'Kelola Diskon',
  '/admin/reservasi': 'Kelola Reservasi',
  '/admin/reports': 'Laporan Pendapatan',
}

export default function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  
  const matchingKey = Object.keys(TITLES).filter(path => location.pathname.startsWith(path)).sort((a,b) => b.length - a.length)[0]
  const title = matchingKey ? TITLES[matchingKey] : 'Admin Panel'

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar 
        items={NAV_ITEMS} 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <Navbar title={title} onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
