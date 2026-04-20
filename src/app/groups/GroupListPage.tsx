import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Users } from 'lucide-react'

import { useMyGroups, usePublicGroups } from '@/hooks/useGroups'
import { GroupCard } from '@/components/groups/GroupCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

export function GroupListPage() {
  const [tab, setTab] = useState<'mine' | 'discover'>('mine')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data: myGroups, isLoading: myLoading } = useMyGroups()
  const { data: publicGroups, isLoading: pubLoading } = usePublicGroups(
    tab === 'discover' ? { search: search || undefined, status: statusFilter || undefined } : undefined
  )

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Groups</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage your SACCO groups</p>
        </div>
        <Button asChild className="bg-teal-600 hover:bg-teal-500 text-white gap-2">
          <Link to="/groups/new">
            <Plus size={16} /> New group
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 mb-6 w-fit">
        {(['mine', 'discover'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
              tab === t
                ? 'bg-slate-800 text-slate-100'
                : 'text-slate-400 hover:text-slate-200',
            ].join(' ')}
          >
            {t === 'mine' ? 'My groups' : 'Discover'}
          </button>
        ))}
      </div>

      {/* Discover filters */}
      {tab === 'discover' && (
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Search groups…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-teal-500"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 bg-slate-800 border-slate-700 text-slate-100">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="" className="text-slate-200 focus:bg-teal-900/40">All statuses</SelectItem>
              <SelectItem value="forming" className="text-slate-200 focus:bg-teal-900/40">Forming</SelectItem>
              <SelectItem value="active"  className="text-slate-200 focus:bg-teal-900/40">Active</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* My groups */}
      {tab === 'mine' && (
        <>
          {myLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl h-24 animate-pulse" />
              ))}
            </div>
          ) : !myGroups?.length ? (
            <EmptyState
              icon={Users}
              title="You're not in any groups yet"
              description="Create a new group or discover public groups to join."
              action={
                <Button asChild className="bg-teal-600 hover:bg-teal-500 text-white gap-2">
                  <Link to="/groups/new"><Plus size={15} /> Create a group</Link>
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {myGroups.map((g) => (
                <GroupCard key={g.id} group={g} showRole />
              ))}
            </div>
          )}
        </>
      )}

      {/* Discover */}
      {tab === 'discover' && (
        <>
          {pubLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl h-24 animate-pulse" />
              ))}
            </div>
          ) : !publicGroups?.length ? (
            <EmptyState
              icon={Search}
              title="No public groups found"
              description="Try adjusting your search or create your own group."
            />
          ) : (
            <div className="space-y-3">
              {publicGroups.map((g) => (
                <GroupCard key={g.id} group={g} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
