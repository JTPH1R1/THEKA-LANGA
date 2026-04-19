import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSession } from '@/hooks/useSession'

interface ProtectedRouteProps {
  redirectTo?: string
}

export function ProtectedRoute({ redirectTo = '/auth/login' }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useSession()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
          <span className="text-sm text-slate-500">Loading…</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  return <Outlet />
}

/** Redirect already-authenticated users away from auth pages */
export function GuestRoute({ redirectTo = '/dashboard' }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useSession()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}
