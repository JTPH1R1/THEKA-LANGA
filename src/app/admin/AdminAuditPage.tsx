import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { AdminNav } from '@/components/admin/AdminNav'
import { useAuditLog } from '@/hooks/useAdmin'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/formatters'
import type { AdminAuditEvent } from '@/types/domain.types'

const ACTION_COLORS: Record<string, string> = {
  INSERT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  UPDATE: 'bg-amber-50 text-amber-700 border-amber-200',
  DELETE: 'bg-rose-50 text-rose-700 border-rose-200',
}

const TABLE_OPTIONS = [
  'profiles','groups','group_members','contributions','loans','loan_repayments',
  'elections','election_votes','kyc_profiles',
]

function DiffRow({ event }: { event: AdminAuditEvent }) {
  const [expanded, setExpanded] = useState(false)
  const hasDiff = event.diff && Object.keys(event.diff).length > 0

  return (
    <tr className="border-t border-gray-200 hover:bg-gray-100/20">
      <td className="px-4 py-3 text-xs font-mono text-slate-400">{event.schemaName}.{event.tableName}</td>
      <td className="px-4 py-3">
        <Badge className={`text-xs ${ACTION_COLORS[event.action] ?? 'text-slate-400'}`}>{event.action}</Badge>
      </td>
      <td className="px-4 py-3 text-sm text-slate-700">{event.actorName ?? <span className="text-slate-400 italic">system</span>}</td>
      <td className="px-4 py-3 text-xs text-slate-400">{formatDateTime(event.changedAt)}</td>
      <td className="px-4 py-3">
        {hasDiff ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700"
          >
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            {Object.keys(event.diff!).length} field{Object.keys(event.diff!).length !== 1 ? 's' : ''}
          </button>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </td>
      {expanded && hasDiff && (
        <tr className="bg-white/50">
          <td colSpan={5} className="px-4 pb-3">
            <pre className="text-xs text-slate-400 overflow-x-auto max-h-32">
              {JSON.stringify(event.diff, null, 2)}
            </pre>
          </td>
        </tr>
      )}
    </tr>
  )
}

export function AdminAuditPage() {
  const [tableFilter, setTableFilter] = useState('all')
  const [actionFilter, setActionFilter] = useState('all')
  const [offset, setOffset] = useState(0)
  const limit = 50

  const { data: events = [], isLoading } = useAuditLog({
    tableName: tableFilter !== 'all' ? tableFilter : undefined,
    action:    actionFilter !== 'all' ? actionFilter : undefined,
    offset,
  })

  return (
    <div>
      <AdminNav />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Audit Log</h1>
          <p className="text-sm text-slate-400 mt-0.5">Immutable record of all data changes</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Select value={tableFilter} onValueChange={(v) => { setTableFilter(v); setOffset(0) }}>
            <SelectTrigger className="w-44 bg-gray-100 border-gray-300 text-slate-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-100 border-gray-300">
              <SelectItem value="all" className="text-slate-900 focus:bg-gray-200">All tables</SelectItem>
              {TABLE_OPTIONS.map((t) => (
                <SelectItem key={t} value={t} className="text-slate-900 focus:bg-gray-200 font-mono text-xs">{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setOffset(0) }}>
            <SelectTrigger className="w-32 bg-gray-100 border-gray-300 text-slate-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-100 border-gray-300">
              <SelectItem value="all"    className="text-slate-900 focus:bg-gray-200">All actions</SelectItem>
              <SelectItem value="INSERT" className="text-slate-900 focus:bg-gray-200">INSERT</SelectItem>
              <SelectItem value="UPDATE" className="text-slate-900 focus:bg-gray-200">UPDATE</SelectItem>
              <SelectItem value="DELETE" className="text-slate-900 focus:bg-gray-200">DELETE</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-xl border border-gray-300 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-3 text-xs text-slate-400 font-medium">Table</th>
                <th className="px-4 py-3 text-xs text-slate-400 font-medium">Action</th>
                <th className="px-4 py-3 text-xs text-slate-400 font-medium">Actor</th>
                <th className="px-4 py-3 text-xs text-slate-400 font-medium">Timestamp</th>
                <th className="px-4 py-3 text-xs text-slate-400 font-medium">Changes</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && [...Array(8)].map((_, i) => (
                <tr key={i} className="border-t border-gray-200">
                  <td colSpan={5} className="px-4 py-3">
                    <div className="h-4 bg-gray-100 animate-pulse rounded w-3/4" />
                  </td>
                </tr>
              ))}
              {!isLoading && events.map((e) => <DiffRow key={e.id} event={e} />)}
              {!isLoading && events.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">No audit events found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>Showing {offset + 1}–{offset + events.length}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0} className="border-gray-300 text-slate-700">Prev</Button>
            <Button size="sm" variant="outline" onClick={() => setOffset(offset + limit)}
              disabled={events.length < limit} className="border-gray-300 text-slate-700">Next</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
