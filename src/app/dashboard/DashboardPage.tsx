import { Link } from 'react-router-dom'
import { LogOut, Settings } from 'lucide-react'
import { toast } from 'sonner'

import { useSession } from '@/hooks/useSession'
import { useMyProfile } from '@/hooks/useProfile'
import { useSignOut } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { KYC_LEVEL_LABELS } from '@/lib/constants'

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join('')
}

export function DashboardPage() {
  const { user } = useSession()
  const { data: profile } = useMyProfile()
  const signOut = useSignOut()

  function handleSignOut() {
    signOut.mutate(undefined, {
      onError: () => toast.error('Failed to sign out. Please try again.'),
    })
  }

  const displayName = profile?.preferredName ?? profile?.fullLegalName ?? user?.email ?? ''

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-teal-400">THEKA LANGA</h1>
            <p className="text-sm text-slate-400 mt-0.5">My Portion</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/profile/edit" aria-label="Edit profile">
              <Avatar className="h-9 w-9 ring-2 ring-slate-700 hover:ring-teal-600 transition-all cursor-pointer">
                <AvatarImage src={profile?.avatarUrl ?? undefined} alt={displayName} />
                <AvatarFallback className="bg-teal-900 text-teal-300 text-sm font-semibold">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              disabled={signOut.isPending}
              className="text-slate-400 hover:text-slate-200 gap-2"
            >
              <LogOut size={16} />
              {signOut.isPending ? 'Signing out…' : 'Sign out'}
            </Button>
          </div>
        </div>

        {/* Profile card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500 mb-1">Signed in as</p>
              <p className="text-lg font-semibold text-slate-100">{displayName}</p>
              <p className="text-sm text-slate-400">{profile?.email ?? user?.email}</p>
              <div className="flex items-center gap-2 mt-3">
                {profile && (
                  <>
                    <Badge variant="outline" className="border-teal-700 text-teal-400 text-xs">
                      KYC {KYC_LEVEL_LABELS[profile.kycLevel]}
                    </Badge>
                    <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
                      Score {profile.creditScore}
                    </Badge>
                    <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs capitalize">
                      {profile.systemRole}
                    </Badge>
                  </>
                )}
              </div>
            </div>
            <Link
              to="/profile/edit"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-400 transition-colors"
            >
              <Settings size={14} />
              Edit profile
            </Link>
          </div>
        </div>

        {/* Placeholder content */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-sm font-medium text-slate-300 mb-1">Dashboard</h2>
          <p className="text-xs text-slate-500">
            Phase 3 complete. KYC wizard (Phase 4) and app shell (Phase 5) are next.
          </p>
        </div>
      </div>
    </div>
  )
}
