import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { CreditCard, Plus, AlertCircle } from 'lucide-react'

import {
  useGroupContributions,
  useDistinctPeriods,
  useGenerateContributionSchedule,
  useWaiveContribution,
} from '@/hooks/useContributions'
import {
  generateScheduleSchema,
  waiveContributionSchema,
  type GenerateScheduleValues,
  type WaiveContributionValues,
} from '@/lib/validators/contribution.schema'
import { ContributionStatusBadge } from '@/components/contributions/ContributionStatusBadge'
import { RecordPaymentDialog } from '@/components/contributions/RecordPaymentDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatCurrency, formatDate } from '@/lib/formatters'
import type { Contribution, GroupMember } from '@/types/domain.types'

// ─── Generate schedule form ───────────────────────────────────────────────────

function defaultPeriod() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function GenerateSchedulePanel({
  groupId,
  onDone,
}: {
  groupId: string
  onDone: (period: string) => void
}) {
  const generate = useGenerateContributionSchedule(groupId)

  const form = useForm<GenerateScheduleValues>({
    resolver: zodResolver(generateScheduleSchema),
    defaultValues: { cyclePeriod: defaultPeriod(), dueDate: '' },
  })

  async function onSubmit(values: GenerateScheduleValues) {
    try {
      const count = await generate.mutateAsync({
        groupId,
        cyclePeriod: values.cyclePeriod,
        dueDate:     values.dueDate,
      })
      toast.success(`Schedule created — ${count} contribution rows generated`)
      onDone(values.cyclePeriod)
    } catch (err) {
      toast.error((err as { message: string }).message)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="bg-slate-900 border border-teal-800/40 rounded-xl p-5 space-y-4"
      >
        <h3 className="text-sm font-medium text-teal-300">Generate contribution schedule</h3>
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="cyclePeriod" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-300 text-xs">Period (YYYY-MM)</FormLabel>
              <FormControl>
                <Input
                  placeholder="2026-04"
                  {...field}
                  className="bg-slate-800 border-slate-700 text-slate-100 focus-visible:ring-teal-500"
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )} />
          <FormField control={form.control} name="dueDate" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-300 text-xs">Due date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  className="bg-slate-800 border-slate-700 text-slate-100 focus-visible:ring-teal-500"
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )} />
        </div>
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={generate.isPending}
            className="bg-teal-600 hover:bg-teal-500 text-white text-sm"
          >
            {generate.isPending ? 'Generating…' : 'Generate'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onDone('')}
            className="text-slate-400 hover:text-slate-200 text-sm"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}

// ─── Waive dialog (has a reason input) ───────────────────────────────────────

function WaiveDialog({
  contribution,
  groupId,
  open,
  onOpenChange,
}: {
  contribution: Contribution | null
  groupId: string
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const waive = useWaiveContribution(groupId)
  const form = useForm<WaiveContributionValues>({
    resolver: zodResolver(waiveContributionSchema),
    defaultValues: { reason: '' },
  })

  async function onSubmit(values: WaiveContributionValues) {
    if (!contribution) return
    try {
      await waive.mutateAsync({ contributionId: contribution.id, reason: values.reason })
      toast.success('Contribution waived')
      onOpenChange(false)
      form.reset()
    } catch (err) {
      toast.error((err as { message: string }).message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Waive contribution?</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="reason" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300 text-xs">Reason (required)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Hardship exemption approved by chair"
                    {...field}
                    className="bg-slate-800 border-slate-700 text-slate-100"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )} />
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={waive.isPending}
                className="bg-teal-600 hover:bg-teal-500 text-white"
              >
                {waive.isPending ? 'Please wait…' : 'Waive'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Summary cards ────────────────────────────────────────────────────────────

function SummaryCards({
  contributions,
  currency,
}: {
  contributions: Contribution[]
  currency: string
}) {
  const paid      = contributions.filter((c) => c.status === 'paid' || c.status === 'partial')
  const pending   = contributions.filter((c) => c.status === 'pending')
  const overdue   = contributions.filter((c) => c.status === 'late' || c.status === 'defaulted')
  const collected = contributions.reduce((s, c) => s + c.paidAmount, 0)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: 'Paid',          value: paid.length,       sub: `of ${contributions.length} members`, color: 'text-teal-300' },
        { label: 'Pending',       value: pending.length,    sub: 'awaiting payment',                   color: 'text-slate-300' },
        { label: 'Overdue',       value: overdue.length,    sub: 'late or defaulted',                  color: overdue.length > 0 ? 'text-amber-300' : 'text-slate-300' },
        { label: 'Total collected', value: formatCurrency(collected, currency), sub: 'this period', color: 'text-slate-100', raw: true },
      ].map(({ label, value, sub, color, raw }) => (
        <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">{label}</p>
          <p className={`text-xl font-bold ${color}`}>{raw ? value : value}</p>
          <p className="text-xs text-slate-500">{sub}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Main tab ─────────────────────────────────────────────────────────────────

interface ContributionsTabProps {
  groupId: string
  currency: string
  myMembership: GroupMember | null
}

export function ContributionsTab({ groupId, currency, myMembership }: ContributionsTabProps) {
  const isOfficer = myMembership?.role === 'chair' || myMembership?.role === 'treasurer'
  const isMember  = !!myMembership && myMembership.status === 'active'

  const { data: periods = [] } = useDistinctPeriods(groupId)

  const [selectedPeriod, setSelectedPeriod] = useState<string>(() => defaultPeriod())
  const [showGenerateForm, setShowGenerateForm] = useState(false)
  const [payTarget, setPayTarget]         = useState<Contribution | null>(null)
  const [waiveTarget, setWaiveTarget]     = useState<Contribution | null>(null)

  const { data: contributions = [], isLoading } = useGroupContributions({
    groupId,
    cyclePeriod: selectedPeriod || undefined,
  })

  const allPeriods = selectedPeriod && !periods.includes(selectedPeriod)
    ? [selectedPeriod, ...periods]
    : periods.length ? periods : [defaultPeriod()]

  function handleGenerateDone(period: string) {
    setShowGenerateForm(false)
    if (period) setSelectedPeriod(period)
  }

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="rounded-md bg-slate-800 border border-slate-700 text-slate-100 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
        >
          {allPeriods.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {isOfficer && !showGenerateForm && (
          <Button
            size="sm"
            onClick={() => setShowGenerateForm(true)}
            className="bg-teal-600 hover:bg-teal-500 text-white gap-1.5 text-xs"
          >
            <Plus size={13} /> Generate schedule
          </Button>
        )}
      </div>

      {/* Generate form */}
      {showGenerateForm && (
        <GenerateSchedulePanel groupId={groupId} onDone={handleGenerateDone} />
      )}

      {/* Summary */}
      {contributions.length > 0 && (
        <SummaryCards contributions={contributions} currency={currency} />
      )}

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="space-y-px p-4 animate-pulse">
            {[1,2,3].map((i) => <div key={i} className="h-14 bg-slate-800 rounded mb-2" />)}
          </div>
        ) : !contributions.length ? (
          <div className="p-4">
            <EmptyState
              icon={CreditCard}
              title="No contributions for this period"
              description={isOfficer ? 'Use "Generate schedule" to create contribution rows for active members.' : 'No contribution schedule has been set for this period yet.'}
            />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-xs text-slate-500 font-medium px-4 py-3">Member</th>
                <th className="text-right text-xs text-slate-500 font-medium px-4 py-3">Expected</th>
                <th className="text-right text-xs text-slate-500 font-medium px-4 py-3">Paid</th>
                <th className="text-right text-xs text-slate-500 font-medium px-4 py-3 hidden sm:table-cell">Fine</th>
                <th className="text-center text-xs text-slate-500 font-medium px-4 py-3">Status</th>
                <th className="text-right text-xs text-slate-500 font-medium px-4 py-3 hidden md:table-cell">Due</th>
                {(isOfficer || isMember) && (
                  <th className="px-4 py-3" />
                )}
              </tr>
            </thead>
            <tbody>
              {contributions.map((c) => {
                const name     = c.profile?.preferredName ?? c.profile?.fullLegalName ?? 'Unknown'
                const initials = name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join('')
                const canRecord = isOfficer && !['paid','waived','reversed'].includes(c.status)
                const canWaive  = isOfficer && ['pending','partial','late'].includes(c.status)
                const isDue     = new Date(c.dueDate) < new Date() && c.status === 'pending'

                return (
                  <tr key={c.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarFallback className="bg-slate-700 text-slate-300 text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <span className="text-slate-200 truncate block">{name}</span>
                          {c.paymentRef && (
                            <span className="text-xs text-slate-500">{c.paymentRef}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300 tabular-nums">
                      {formatCurrency(c.expectedAmount, currency)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <span className={c.paidAmount > 0 ? 'text-teal-300' : 'text-slate-500'}>
                        {formatCurrency(c.paidAmount, currency)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-amber-400 hidden sm:table-cell">
                      {c.fineAmount > 0 ? formatCurrency(c.fineAmount, currency) : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <ContributionStatusBadge status={c.status} />
                        {isDue && <AlertCircle size={12} className="text-amber-400" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500 text-xs hidden md:table-cell">
                      {formatDate(c.dueDate)}
                    </td>
                    {(isOfficer || isMember) && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canRecord && (
                            <Button
                              size="sm"
                              onClick={() => setPayTarget(c)}
                              className="h-7 px-2 bg-teal-700 hover:bg-teal-600 text-white text-xs"
                            >
                              Record
                            </Button>
                          )}
                          {canWaive && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setWaiveTarget(c)}
                              className="h-7 px-2 text-slate-400 hover:text-slate-200 text-xs"
                            >
                              Waive
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Record payment dialog */}
      {payTarget && (
        <RecordPaymentDialog
          contribution={payTarget}
          groupId={groupId}
          currency={currency}
          open={!!payTarget}
          onOpenChange={(v) => !v && setPayTarget(null)}
        />
      )}

      {/* Waive dialog */}
      <WaiveDialog
        contribution={waiveTarget}
        groupId={groupId}
        open={!!waiveTarget}
        onOpenChange={(v) => !v && setWaiveTarget(null)}
      />
    </div>
  )
}
