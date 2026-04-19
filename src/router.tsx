import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute, GuestRoute } from '@/components/auth/ProtectedRoute'
import { LoginPage } from '@/app/auth/LoginPage'
import { RegisterPage } from '@/app/auth/RegisterPage'
import { ResetPasswordPage } from '@/app/auth/ResetPasswordPage'
import { NewPasswordPage } from '@/app/auth/NewPasswordPage'
import { DashboardPage } from '@/app/dashboard/DashboardPage'

export const router = createBrowserRouter([
  // Redirect root to dashboard (ProtectedRoute handles the /auth/login redirect if unauthenticated)
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },

  // Guest-only routes — logged-in users are redirected to /dashboard
  {
    element: <GuestRoute />,
    children: [
      { path: '/auth/login',          element: <LoginPage /> },
      { path: '/auth/register',       element: <RegisterPage /> },
      { path: '/auth/reset-password', element: <ResetPasswordPage /> },
    ],
  },

  // New password — accessible to authenticated users (via password reset email)
  {
    path: '/auth/new-password',
    element: <NewPasswordPage />,
  },

  // Protected routes — unauthenticated users are redirected to /auth/login
  {
    element: <ProtectedRoute />,
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
