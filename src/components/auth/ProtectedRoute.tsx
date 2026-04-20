import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSession } from '@/hooks/useSession'
import { useProfileComplete } from '@/hooks/useProfile'

function Spinner() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
        <span className="text-sm text-slate-500">Loading…</span>
      </div>
    </div>
  )
}

interface RouteProps {
  redirectTo?: string
}

/** Requires authentication. Unauthenticated users go to /auth/login. */
export function ProtectedRoute({ redirectTo = '/auth/login' }: RouteProps) {
  const { isAuthenticated, isLoading } = useSession()
  const location = useLocation()

  if (isLoading) return <Spinner />

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  return <Outlet />
}

/**
 * Requires authentication AND a completed profile setup (preferred_name set).
 * Redirects to /profile/setup if the profile is incomplete.
 */
export function ProfileRequiredRoute() {
  const { isAuthenticated, isLoading: sessionLoading } = useSession()
  const { isComplete, isLoading: profileLoading } = useProfileComplete()
  const location = useLocation()

  if (sessionLoading || profileLoading) return <Spinner />

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  if (!isComplete) {
    return <Navigate to="/profile/setup" replace />
  }

  return <Outlet />
}

/** Redirect already-authenticated users away from auth pages. */
export function GuestRoute({ redirectTo = '/dashboard' }: RouteProps) {
  const { isAuthenticated, isLoading } = useSession()

  if (isLoading) return <Spinner />

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}
