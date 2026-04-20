import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute, ProfileRequiredRoute, GuestRoute } from '@/components/auth/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/app/auth/LoginPage'
import { RegisterPage } from '@/app/auth/RegisterPage'
import { ResetPasswordPage } from '@/app/auth/ResetPasswordPage'
import { NewPasswordPage } from '@/app/auth/NewPasswordPage'
import { ProfileSetupPage } from '@/app/profile/ProfileSetupPage'
import { EditProfilePage } from '@/app/profile/EditProfilePage'
import { DashboardPage } from '@/app/dashboard/DashboardPage'
import { KycWizardPage } from '@/app/kyc/KycWizardPage'
import { GroupListPage } from '@/app/groups/GroupListPage'
import { GroupCreatePage } from '@/app/groups/GroupCreatePage'
import { GroupDetailPage } from '@/app/groups/GroupDetailPage'
import { PersonalPage } from '@/app/personal/PersonalPage'
import { ReportsPage } from '@/app/reports/ReportsPage'

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
    ],
  },

  // Auth + profile required — all main app routes wrapped in AppShell
  {
    element: <ProfileRequiredRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/dashboard',   element: <DashboardPage /> },
          { path: '/kyc',         element: <KycWizardPage /> },
          { path: '/profile/edit', element: <EditProfilePage /> },
          { path: '/groups',          element: <GroupListPage /> },
          { path: '/groups/new',      element: <GroupCreatePage /> },
          { path: '/groups/:id',      element: <GroupDetailPage /> },
          { path: '/groups/:id/:tab', element: <GroupDetailPage /> },
          { path: '/personal', element: <PersonalPage /> },
          { path: '/reports', element: <ReportsPage /> },
          {
            path: '/admin',
            element: (
              <div className="p-8 text-center text-slate-500 text-sm">
                Admin Panel — coming in Phase 13
              </div>
            ),
          },
        ],
      },
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
