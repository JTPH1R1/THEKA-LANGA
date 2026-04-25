import { useState } from 'react'
import { Search, Ban, CheckCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { AdminNav } from '@/components/admin/AdminNav'
import { useAdminUsers, useBlacklistUser, useUnblacklistUser } from '@/hooks/useAdmin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { formatDate } from '@/lib/formatters'
import type { AdminUser } from '@/types/domain.types'

const KYC_COLORS: Record<number, string> = {
  0: 'text-slate-400', 1: 'text-amber-600', 2: 'text-teal-600', 3: 'text-emerald-700',
}

function BlacklistDialog({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const [reason, setReason] = useState('')
  const blacklist = useBlacklistUser()
  const unblacklist = useUnblacklistUser()

  async function handleBlacklist() {
    if (!reason.trim()) return
    try {
      await blacklist.mutateAsync({ profileId: user.id, reason })
      toast.success(`${user.preferredName ?? user.fullLegalName} blacklisted`)
      onClose()
    } catch (e) { toast.error((e as Error).message) }
  }

  async function handleUnblacklist() {
    try {
      await unblacklist.mutateAsync(user.id)
      toast.success(`${user.preferredName ?? user.fullLegalName} unblacklisted`)
      onClose()
    } catch (e) { toast.error((e as Error).message) }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-white border-gray-300 text-slate-900">
        <DialogHeader>
          <DialogTitle>
            {user.isBlacklisted ? 'Remove from blacklist' : 'Blacklist user'}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-400">{user.fullLegalName} · {user.email}</p>
        {!user.isBlacklisted && (
          <Input
            placeholder="Reason for blacklisting…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="bg-gray-100 border-gray-300 text-slate-900"
          />
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-gray-300 text-slate-700">Cancel</Button>
          {user.isBlacklisted
            ? <Button onClick={handleUnblacklist} disabled={unblacklist.isPending} className="bg-teal-600 hover:bg-teal-700">Unblacklist</Button>
            : <Button onClick={handleBlacklist} disabled={blacklist.isPending || !reason.trim()} variant="destructive">Blacklist</Button>
          }
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [kycFilter, setKycFilter] = useState<string>('all')
  const [blacklistFilter, setBlacklistFilter] = useState<string>('all')
  const [actionUser, setActionUser] = useState<AdminUser | null>(null)

  const { data: users = [], isLoading, refetch, isFetching } = useAdminUsers({
    search: search || undefined,
    kycLevel: kycFilter !== 'all' ? Number(kycFilter) : undefined,
    blacklisted: blacklistFilter === 'blacklisted' ? true : blacklistFilter === 'active' ? false : undefined,
  })

  return (
    <div>
      <AdminNav />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Users</h1>
            <p className="text-sm text-slate-400 mt-0.5">{users.length} profiles</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="border-gray-300 text-slate-700 hover:text-slate-900"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
            <span className="ml-1.5">Refresh</span>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 bg-gray-100 border-gray-300 text-slate-900"
            />
          </div>
          <Select value={kycFilter} onValueChange={setKycFilter}>
            <SelectTrigger className="w-36 bg-gray-100 border-gray-300 text-slate-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-100 border-gray-300">
              <SelectItem value="all" className="text-slate-900 focus:bg-gray-200">All KYC levels</SelectItem>
              {[0,1,2,3].map((l) => (
                <SelectItem key={l} value={String(l)} className="text-slate-900 focus:bg-gray-200">KYC Level {l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={blacklistFilter} onValueChange={setBlacklistFilter}>
            <SelectTrigger className="w-36 bg-gray-100 border-gray-300 text-slate-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-100 border-gray-300">
              <SelectItem value="all"         className="text-slate-900 focus:bg-gray-200">All users</SelectItem>
              <SelectItem value="active"      className="text-slate-900 focus:bg-gray-200">Active only</SelectItem>
              <SelectItem value="blacklisted" className="text-slate-900 focus:bg-gray-200">Blacklisted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-gray-300 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-3 text-xs text-slate-400 font-medium">Name / Email</th>
                <th className="px-4 py-3 text-xs text-slate-400 font-medium">Role</th>
                <th className="px-4 py-3 text-xs text-slate-400 font-medium text-center">KYC</th>
                <th className="px-4 py-3 text-xs text-slate-400 font-medium text-right">Score</th>
                <th className="px-4 py-3 text-xs text-slate-400 font-medium text-center">Groups</th>
                <th className="px-4 py-3 text-xs text-slate-400 font-medium">Joined</th>
                <th className="px-4 py-3 text-xs text-slate-400 font-medium">Status</th>
                <th className="px-4 py-3 text-xs text-slate-400 font-medium" />
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-t border-gray-200">
                    <td colSpan={8} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 animate-pulse rounded w-2/3" />
                    </td>
                  </tr>
                ))
              )}
              {!isLoading && users.map((u) => (
                <tr key={u.id} className="border-t border-gray-200 hover:bg-gray-100/30">
                  <td className="px-4 py-3">
                    <p className="text-slate-800 font-medium">{u.preferredName ?? u.fullLegalName}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    {u.systemRole !== 'member'
                      ? <Badge variant="outline" className="border-teal-300 text-teal-700 text-xs">{u.systemRole}</Badge>
                      : <span className="text-xs text-slate-400">member</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-mono font-bold ${KYC_COLORS[u.kycLevel]}`}>{u.kycLevel}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-700">{u.creditScore}</td>
                  <td className="px-4 py-3 text-center text-slate-400">{u.groupCount}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    {u.isBlacklisted
                      ? <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-xs">Blacklisted</Badge>
                      : <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Active</Badge>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setActionUser(u)}
                      className={u.isBlacklisted ? 'text-teal-600 hover:text-teal-700' : 'text-rose-600 hover:text-rose-700'}
                    >
                      {u.isBlacklisted ? <CheckCircle size={14} /> : <Ban size={14} />}
                    </Button>
                  </td>
                </tr>
              ))}
              {!isLoading && users.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400 text-sm">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {actionUser && <BlacklistDialog user={actionUser} onClose={() => setActionUser(null)} />}
      </div>
    </div>
  )
}
