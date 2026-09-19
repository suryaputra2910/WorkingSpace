import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Loading from '../components/common/Loading.jsx'

// allowedRoles: array of roles permitted to view nested routes.
// Members are blocked from Admin pages and vice versa.
export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, isLoading, role } = useAuth()

  if (isLoading) return <Loading label="Memeriksa sesi..." />

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(role)) {
    const fallback = role === 'admin_space' ? '/admin/dashboard' : '/member/dashboard'
    return <Navigate to={fallback} replace />
  }

  return <Outlet />
}
