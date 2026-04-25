import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, Snowflake, Play } from 'lucide-react'
import { toast } from 'sonner'
import { AdminNav } from '@/components/admin/AdminNav'
import { useAdminGroups, useFreezeGroup, useUnfreezeGroup } from '@/hooks/useAdmin'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { GroupStatusBadge } from '@/components/groups/GroupStatusBadge'
import type { AdminGroup } from '@/types/domain.types'

export function AdminGroupsPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const { data: groups = [], isLoading } = useAdminGroups(statusFilter !== 'all' ? statusFilter : undefined)
  const freeze   = useFreezeGroup()
  const unfreeze = useUnfreezeGroup()

  async function handleFreeze(g: AdminGroup) {
    try {
      await freeze.mutateAsync(g.id)
      toast.success(`${g.name} frozen`)
    } catch (e) { toast.error((e as Error).message) }
  }

  async function handleUnfreeze(g: AdminGroup) {
    try {
      await unfreeze.mutateAsync(g.id)
      toast.success(`${g.name} unfrozen`)
    } catch (e) { toast.error((e as Error).message) }
  }

  return (
    <div>
      <AdminNav />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Groups</h1>
            <p className="text-sm text-slate-400 mt-0.5">{groups.length} groups</p>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 bg-gray-100 border-gray-300 text-slate-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-100 border-gray-300">
              <SelectItem value="all"     className="text-slate-900 focus:bg-gray-200">All statuses</SelectItem>
              <SelectItem value="forming" className="text-slate-900 focus:bg-gray-200">Forming</SelectItem>
              <SelectItem value="active"  className="text-slate-900 focus:bg-gray-200">Active</SelectItem>
              <SelectItem value="frozen"  className="text-slate-900 focus:bg-gray-200">Frozen</SelectItem>
              <SelectItem value="closed"  className="text-slate-900 focus:bg-gray-200">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-xl border border-gray-300 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-3 text-xs text-slate-400 font-medium">Group</th>
                <th className="px-4 py-3 text-xs text-slate-400 font-medium">Status</th>
                <th className="px-4 py-3 text-xs text-slate-400 font-medium text-center">Members</th>
                <th className="px-4 py-3 text-xs text-slate-400 font-medium text-right">Contributions</th>
                <th className="px-4 py-3 text-xs text-slate-400 font-medium text-right">Loan Book</th>
                <th className="px-4 py-3 text-xs text-slate-400 font-medium text-center">Defaults</th>
                <th className="px-4 py-3 text-xs text-slate-400 font-medium">Created</th>
                <th className="px-4 py-3 text-xs text-slate-400 font-medium" />
              </tr>
            </thead>
            <tbody>
              {isLoading && [...Array(5)].map((_, i) => (
                <tr key={i} className="border-t border-gray-200">
                  <td colSpan={8} className="px-4 py-3">
                    <div className="h-4 bg-gray-100 animate-pulse rounded w-2/3" />
                  </td>
                </tr>
              ))}
              {!isLoading && groups.map((g) => (
                <tr key={g.id} className="border-t border-gray-200 hover:bg-gray-100/30">
                  <td className="px-4 py-3">
                    <p className="text-slate-800 font-medium">{g.name}</p>
                    <p className="text-xs text-slate-400">{g.type} · {g.currency}</p>
                  </td>
                  <td className="px-4 py-3"><GroupStatusBadge status={g.status} /></td>
                  <td className="px-4 py-3 text-center text-slate-700">{g.memberCount}</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-700 text-xs">{formatCurrency(g.totalContributions, g.currency)}</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-700 text-xs">{formatCurrency(g.activeLoanBook, g.currency)}</td>
                  <td className="px-4 py-3 text-center">
                    {g.totalDefaults > 0
                      ? <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-xs">{g.totalDefaults}</Badge>
                      : <span className="text-slate-400 text-xs">—</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{formatDate(g.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link to={`/groups/${g.id}`} className="p-1.5 text-slate-400 hover:text-slate-700">
                        <ExternalLink size={13} />
                      </Link>
                      {g.status === 'active' && (
                        <Button size="sm" variant="ghost" onClick={() => handleFreeze(g)}
                          disabled={freeze.isPending} className="p-1.5 text-amber-600 hover:text-amber-600">
                          <Snowflake size={13} />
                        </Button>
                      )}
                      {g.status === 'frozen' && (
                        <Button size="sm" variant="ghost" onClick={() => handleUnfreeze(g)}
                          disabled={unfreeze.isPending} className="p-1.5 text-teal-600 hover:text-teal-700">
                          <Play size={13} />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && groups.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400 text-sm">No groups found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
