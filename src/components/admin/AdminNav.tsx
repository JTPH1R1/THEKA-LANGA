import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Building2, ShieldCheck, ScrollText, ServerCog } from 'lucide-react'
import { cn } from '@/lib/utils'

const LINKS: { to: string; label: string; icon: React.ElementType; end?: boolean }[] = [
  { to: '/admin',        label: 'Overview',  icon: LayoutDashboard, end: true },
  { to: '/admin/users',  label: 'Users',     icon: Users            },
  { to: '/admin/groups', label: 'Groups',    icon: Building2        },
  { to: '/admin/kyc',    label: 'KYC Queue', icon: ShieldCheck      },
  { to: '/admin/audit',  label: 'Audit Log', icon: ScrollText       },
  { to: '/admin/jobs',   label: 'Jobs',      icon: ServerCog        },
]

export function AdminNav() {
  return (
    <div className="border-b border-slate-800 bg-slate-900/50 px-4">
      <nav className="flex gap-1 overflow-x-auto">
        {LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-1.5 px-3 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors',
                isActive
                  ? 'border-teal-400 text-teal-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200',
              )
            }
          >
            <Icon size={14} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
