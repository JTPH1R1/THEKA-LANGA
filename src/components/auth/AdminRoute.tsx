import { Navigate, Outlet } from 'react-router-dom'
import { useMyProfile } from '@/hooks/useProfile'
import { useSession } from '@/hooks/useSession'

function Spinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
    </div>
  )
}

export function AdminRoute() {
  const { isAuthenticated, isLoading: sessionLoading } = useSession()
  const { data: profile, isLoading: profileLoading } = useMyProfile()

  if (sessionLoading || profileLoading) return <Spinner />
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />

  const isAdmin = profile?.systemRole === 'system_admin' || profile?.systemRole === 'support'
  if (!isAdmin) return <Navigate to="/dashboard" replace />

  return <Outlet />
}
