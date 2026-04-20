import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute, ProfileRequiredRoute, GuestRoute } from '@/components/auth/ProtectedRoute'
import { LoginPage } from '@/app/auth/LoginPage'
import { RegisterPage } from '@/app/auth/RegisterPage'
import { ResetPasswordPage } from '@/app/auth/ResetPasswordPage'
import { NewPasswordPage } from '@/app/auth/NewPasswordPage'
import { ProfileSetupPage } from '@/app/profile/ProfileSetupPage'
import { EditProfilePage } from '@/app/profile/EditProfilePage'
import { DashboardPage } from '@/app/dashboard/DashboardPage'

export const router = createBrowserRouter([
  // Root redirect
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },

  // Guest-only — logged-in users redirect to /dashboard
  {
    element: <GuestRoute />,
    children: [
      { path: '/auth/login',          element: <LoginPage /> },
      { path: '/auth/register',       element: <RegisterPage /> },
      { path: '/auth/reset-password', element: <ResetPasswordPage /> },
    ],
  },

  // Auth only (no profile requirement) — password reset redirect lands here
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/auth/new-password',  element: <NewPasswordPage /> },
      { path: '/profile/setup',      element: <ProfileSetupPage /> },
      { path: '/profile/edit',       element: <EditProfilePage /> },
    ],
  },

  // Auth + profile required — main app routes go here
  {
    element: <ProfileRequiredRoute />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
    ],
  },

  // 404
  {
    path: '*',
    element: (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 gap-3">
        <div className="text-4xl font-bold text-slate-700">404</div>
        <div className="text-slate-400">Page not found</div>
        <a href="/dashboard" className="text-teal-400 text-sm hover:underline">Go to dashboard</a>
      </div>
    ),
  },
])
