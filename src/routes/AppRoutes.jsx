import { Routes, Route, Navigate } from 'react-router-dom'

import AuthLayout from '../layouts/AuthLayout.jsx'
import MemberLayout from '../layouts/MemberLayout.jsx'
import AdminLayout from '../layouts/AdminLayout.jsx'
import PublicLayout from '../layouts/PublicLayout.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'

import LoginPage from '../pages/auth/LoginPage.jsx'
import RegisterPage from '../pages/auth/RegisterPage.jsx'
import SetupAppKeyPage from '../pages/auth/SetupAppKeyPage.jsx'

import LandingPage from '../pages/public/LandingPage.jsx'

import MemberDashboard from '../pages/member/Dashboard.jsx'
import MemberProfile from '../pages/member/Profile.jsx'
import SpaceList from '../pages/member/SpaceList.jsx'
import SpaceDetail from '../pages/member/SpaceDetail.jsx'
import ReservasiList from '../pages/member/ReservasiList.jsx'
import ReservasiDetail from '../pages/member/ReservasiDetail.jsx'
import HistoryList from '../pages/member/HistoryList.jsx'
import ETicket from '../pages/member/ETicket.jsx'

import AdminDashboard from '../pages/admin/Dashboard.jsx'
import AdminProfile from '../pages/admin/Profile.jsx'
import AdminMembers from '../pages/admin/Members.jsx'
import AdminMemberDetail from '../pages/admin/MemberDetail.jsx'
import AdminSpaces from '../pages/admin/Spaces.jsx'
import AdminSpaceDetail from '../pages/admin/SpaceDetail.jsx'
import AdminDiskon from '../pages/admin/Diskon.jsx'
import AdminDiskonDetail from '../pages/admin/DiskonDetail.jsx'
import AdminReservasi from '../pages/admin/Reservasi.jsx'
import AdminReports from '../pages/admin/Reports.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/spaces" element={<SpaceList />} />
      </Route>

      <Route path="/setup-app-key" element={<SetupAppKeyPage />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['member']} />}>
        <Route element={<MemberLayout />}>
          <Route path="/member/dashboard" element={<MemberDashboard />} />
          <Route path="/member/profile" element={<MemberProfile />} />
          <Route path="/member/spaces" element={<SpaceList />} />
          <Route path="/member/spaces/:id" element={<SpaceDetail />} />
          <Route path="/member/reservasi" element={<ReservasiList />} />
          <Route path="/member/reservasi/:id" element={<ReservasiDetail />} />
          <Route path="/member/history" element={<HistoryList />} />
          <Route path="/member/e-ticket/:id" element={<ETicket />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['admin_space']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="/admin/members" element={<AdminMembers />} />
          <Route path="/admin/members/:id" element={<AdminMemberDetail />} />
          <Route path="/admin/spaces" element={<AdminSpaces />} />
          <Route path="/admin/spaces/:id" element={<AdminSpaceDetail />} />
          <Route path="/admin/diskon" element={<AdminDiskon />} />
          <Route path="/admin/diskon/:id" element={<AdminDiskonDetail />} />
          <Route path="/admin/reservasi" element={<AdminReservasi />} />
          <Route path="/admin/reports" element={<AdminReports />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
