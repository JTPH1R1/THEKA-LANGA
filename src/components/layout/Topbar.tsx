import { Link, useNavigate } from 'react-router-dom'
import { Menu, LogOut, User } from 'lucide-react'
import { toast } from 'sonner'

import { useMyProfile } from '@/hooks/useProfile'
import { useSignOut } from '@/hooks/useAuth'
import { useUiStore } from '@/stores/ui.store'
import { NotificationBell } from '@/components/layout/NotificationBell'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')
}

export function Topbar() {
  const { data: profile } = useMyProfile()
  const signOut = useSignOut()
  const { toggleSidebar } = useUiStore()
  const navigate = useNavigate()

  const displayName = profile?.preferredName ?? profile?.fullLegalName ?? ''

  function handleSignOut() {
    signOut.mutate(undefined, {
      onError: () => toast.error('Failed to sign out. Please try again.'),
    })
  }

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 shrink-0 shadow-sm">
      {/* Mobile menu toggle */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden text-slate-500 hover:text-slate-700 p-1"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile brand (desktop shows in sidebar) */}
      <Link
        to="/dashboard"
        className="lg:hidden text-sm font-bold text-teal-600 tracking-wide"
      >
        THEKA LANGA
      </Link>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right actions */}
      <NotificationBell />

      {/* Avatar → profile edit */}
      <button
        onClick={() => navigate('/profile/edit')}
        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
        aria-label="Edit profile"
      >
        <Avatar className="h-7 w-7 ring-1 ring-gray-200">
          <AvatarImage src={profile?.avatarUrl ?? undefined} alt={displayName} />
          <AvatarFallback className="bg-teal-100 text-teal-700 text-xs font-semibold">
            {getInitials(displayName) || <User size={12} />}
          </AvatarFallback>
        </Avatar>
        <span className="hidden sm:block text-xs max-w-[120px] truncate">{displayName}</span>
      </button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        disabled={signOut.isPending}
        className="text-slate-400 hover:text-slate-700 p-2"
        aria-label="Sign out"
      >
        <LogOut size={16} />
      </Button>
    </header>
  )
}
