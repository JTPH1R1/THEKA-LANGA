import { NavLink, Link } from 'react-router-dom'
import {
  LayoutDashboard, Users,
  PiggyBank, FileText, ShieldCheck, Settings, X,
} from 'lucide-react'

import { useMyProfile } from '@/hooks/useProfile'
import { useUiStore } from '@/stores/ui.store'
import { KycLevelBadge } from '@/components/kyc/KycLevelBadge'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/dashboard',  label: 'Dashboard',      icon: LayoutDashboard },
  { to: '/groups',     label: 'Groups',          icon: Users           },
  { to: '/personal',   label: 'Personal Finance', icon: PiggyBank      },
  { to: '/reports',    label: 'Reports',         icon: FileText        },
] as const

const ADMIN_ITEMS = [
  { to: '/admin',      label: 'Admin Panel',     icon: Settings        },
] as const

interface NavItemProps {
  to: string
  label: string
  icon: React.ElementType
  onClick?: () => void
}

function NavItem({ to, label, icon: Icon, onClick }: NavItemProps) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      end={to === '/dashboard'}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-teal-900/40 text-teal-300 border border-teal-800/60'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800',
        )
      }
    >
      <Icon size={17} />
      {label}
    </NavLink>
  )
}

interface SidebarProps {
  mobile?: boolean
}

export function Sidebar({ mobile = false }: SidebarProps) {
  const { data: profile } = useMyProfile()
  const { sidebarOpen, setSidebarOpen } = useUiStore()
  const isAdmin = profile?.systemRole === 'system_admin' || profile?.systemRole === 'support'

  function close() {
    setSidebarOpen(false)
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/80 lg:hidden"
          onClick={close}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'flex flex-col bg-slate-900 border-r border-slate-800 h-full',
          mobile
            ? cn(
                'fixed inset-y-0 left-0 z-40 w-64 transition-transform duration-200 lg:hidden',
                sidebarOpen ? 'translate-x-0' : '-translate-x-full',
              )
            : 'hidden lg:flex w-60 shrink-0',
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-slate-800 shrink-0">
          <Link to="/dashboard" className="flex flex-col leading-tight" onClick={mobile ? close : undefined}>
            <span className="text-base font-bold text-teal-400 tracking-wide">THEKA LANGA</span>
            <span className="text-[10px] text-slate-500 -mt-0.5">My Portion</span>
          </Link>
          {mobile && (
            <button
              onClick={close}
              className="text-slate-500 hover:text-slate-300 p-1"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Main nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} {...item} onClick={mobile ? close : undefined} />
          ))}

          {/* KYC shortcut if not fully verified */}
          {profile && profile.kycLevel < 3 && (
            <NavItem
              to="/kyc"
              label="Verification"
              icon={ShieldCheck}
              onClick={mobile ? close : undefined}
            />
          )}

          {/* Admin section */}
          {isAdmin && (
            <>
              <div className="pt-4 pb-1 px-1">
                <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                  Administration
                </p>
              </div>
              {ADMIN_ITEMS.map((item) => (
                <NavItem key={item.to} {...item} onClick={mobile ? close : undefined} />
              ))}
            </>
          )}
        </nav>

        {/* Profile summary at bottom */}
        {profile && (
          <div className="px-3 py-3 border-t border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-teal-900 flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-teal-300">
                  {(profile.preferredName ?? profile.fullLegalName ?? '?')
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((n) => n[0].toUpperCase())
                    .join('')}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-200 truncate">
                  {profile.preferredName ?? profile.fullLegalName}
                </p>
                <KycLevelBadge level={profile.kycLevel} size="sm" />
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
