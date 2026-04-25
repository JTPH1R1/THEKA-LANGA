import { useState } from 'react'
import { CheckCircle, XCircle, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { AdminNav } from '@/components/admin/AdminNav'
import { useKycQueue, useApproveKyc, useRejectKyc } from '@/hooks/useAdmin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/formatters'
import type { AdminKycEntry } from '@/types/domain.types'

const RISK_COLOR: Record<string, string> = {
  low: 'text-emerald-700', medium: 'text-amber-600', high: 'text-rose-600', unknown: 'text-slate-400',
}

function RejectDialog({ entry, onClose }: { entry: AdminKycEntry; onClose: () => void }) {
  const [reason, setReason] = useState('')
  const reject = useRejectKyc()

  async function handle() {
    if (!reason.trim()) return
    try {
      await reject.mutateAsync({ profileId: entry.profileId, reason })
      toast.success('KYC rejected')
      onClose()
    } catch (e) { toast.error((e as Error).message) }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-white border-gray-300 text-slate-900">
        <DialogHeader>
          <DialogTitle>Reject KYC — {entry.fullLegalName}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-400">{entry.email}</p>
        <Input
          placeholder="Reason for rejection…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="bg-gray-100 border-gray-300 text-slate-900"
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-gray-300 text-slate-700">Cancel</Button>
          <Button onClick={handle} disabled={reject.isPending || !reason.trim()} variant="destructive">Reject</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AdminKycPage() {
  const { data: queue = [], isLoading } = useKycQueue()
  const approve = useApproveKyc()
  const [rejectEntry, setRejectEntry] = useState<AdminKycEntry | null>(null)

  async function handleApprove(entry: AdminKycEntry) {
    try {
      await approve.mutateAsync(entry.profileId)
      toast.success(`${entry.fullLegalName} — KYC approved (Level ${entry.kycLevel + 1})`)
    } catch (e) { toast.error((e as Error).message) }
  }

  return (
    <div>
      <AdminNav />
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-teal-500/10 border border-teal-500/20">
            <ShieldCheck size={18} className="text-teal-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">KYC Review Queue</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {isLoading ? '…' : `${queue.length} submissions pending review`}
            </p>
          </div>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-300 bg-gray-100/30 p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && queue.length === 0 && (
          <div className="rounded-xl border border-gray-300 bg-gray-100/20 p-10 text-center">
            <ShieldCheck size={32} className="text-slate-400 mx-auto mb-3" />
            <p className="text-slate-400">No pending KYC submissions</p>
          </div>
        )}

        <div className="space-y-3">
          {queue.map((entry) => (
            <div key={entry.profileId} className="rounded-xl border border-gray-300 bg-gray-100/30 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-slate-900 font-medium">{entry.fullLegalName}</p>
                    <Badge variant="outline" className="border-gray-300 text-slate-400 text-xs">
                      Level {entry.kycLevel} → {entry.kycLevel + 1}
                    </Badge>
                    <span className={`text-xs font-medium ${RISK_COLOR[entry.riskRating]}`}>
                      {entry.riskRating.toUpperCase()} RISK
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{entry.email}</p>
                  {entry.phone && <p className="text-xs text-slate-400">{entry.phone}</p>}
                  {entry.submittedAt && (
                    <p className="text-xs text-slate-400 mt-1">Submitted {formatDate(entry.submittedAt)}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => setRejectEntry(entry)}
                    variant="outline"
                    className="border-rose-200 text-rose-600 hover:bg-rose-50 gap-1.5"
                  >
                    <XCircle size={13} /> Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(entry)}
                    disabled={approve.isPending}
                    className="bg-teal-700 hover:bg-teal-600 gap-1.5"
                  >
                    <CheckCircle size={13} /> Approve
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {rejectEntry && <RejectDialog entry={rejectEntry} onClose={() => setRejectEntry(null)} />}
      </div>
    </div>
  )
}
