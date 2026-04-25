import { useState } from 'react'
import { FileBarChart2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMyGroups } from '@/hooks/useGroups'
import { ReportsTab } from '@/app/groups/tabs/ReportsTab'

export function ReportsPage() {
  const { data: groups = [], isLoading } = useMyGroups()
  const activeGroups = groups.filter((g) => g.status === 'active')
  const [groupId, setGroupId] = useState('')
  const selectedId = groupId || activeGroups[0]?.id || ''
  const selectedGroup = groups.find((g) => g.id === selectedId)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20">
          <FileBarChart2 className="size-6 text-teal-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-400 mt-0.5">Generate PDF reports for your groups</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-slate-400 uppercase tracking-wide">Select Group</label>
        {isLoading ? (
          <div className="h-10 w-64 bg-gray-100 animate-pulse rounded-md" />
        ) : activeGroups.length === 0 ? (
          <p className="text-sm text-slate-400">You have no active groups. Join or create a group to generate reports.</p>
        ) : (
          <Select value={selectedId} onValueChange={setGroupId}>
            <SelectTrigger className="w-72 bg-gray-100 border-gray-300 text-slate-900">
              <SelectValue placeholder="Choose a group…" />
            </SelectTrigger>
            <SelectContent className="bg-gray-100 border-gray-300">
              {activeGroups.map((g) => (
                <SelectItem key={g.id} value={g.id} className="text-slate-900 focus:bg-gray-200">
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {selectedGroup && (
        <ReportsTab groupId={selectedId} currency={selectedGroup.currency} />
      )}
    </div>
  )
}
