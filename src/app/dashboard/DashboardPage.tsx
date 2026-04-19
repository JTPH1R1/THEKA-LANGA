import { LogOut } from 'lucide-react'
import { toast } from 'sonner'

import { useSession } from '@/hooks/useSession'
import { useSignOut } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

export function DashboardPage() {
  const { user } = useSession()
  const signOut = useSignOut()

  function handleSignOut() {
    signOut.mutate(undefined, {
      onError: () => toast.error('Failed to sign out. Please try again.'),
    })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-teal-400">THEKA LANGA</h1>
            <p className="text-sm text-slate-400 mt-0.5">My Portion</p>
          </div>
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

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-1">Dashboard</h2>
          <p className="text-sm text-slate-400 mb-4">Phase 2 complete — auth is working.</p>
          <div className="text-xs text-slate-500 bg-slate-800 rounded-lg p-3 font-mono">
            <div>uid: {user?.id}</div>
            <div>email: {user?.email}</div>
          </div>
          <p className="text-xs text-slate-600 mt-4">
            Phase 3 (Profile) and Phase 4 (KYC) are next.
          </p>
        </div>
      </div>
    </div>
  )
}
