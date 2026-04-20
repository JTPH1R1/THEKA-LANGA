import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { FileText, Plus } from 'lucide-react'

import { useGroupLoans, useApplyForLoan, useRespondToGuarantor, useMyGuarantorRequests } from '@/hooks/useLoans'
import { useGroupMembers } from '@/hooks/useGroupMembers'
import { useGroupRules } from '@/hooks/useGroups'
import { loanApplicationSchema, type LoanApplicationValues } from '@/lib/validators/loan.schema'
import { LoanCard } from '@/components/loans/LoanCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatCurrency } from '@/lib/formatters'
import type { GroupMember, LoanStatus } from '@/types/domain.types'

// ─── Loan application form ────────────────────────────────────────────────────

function LoanApplicationPanel({
  groupId, currency, currentUserId, myMembership: _myMembership,
  onDone,
}: {
  groupId: string
  currency: string
  currentUserId: string
  myMembership: GroupMember
  onDone: () => void
}) {
  const { data: rules } = useGroupRules(groupId)
  const { data: members = [] } = useGroupMembers(groupId)
  const applyForLoan = useApplyForLoan(groupId)

  const otherMembers = members.filter(
    (m) => m.profileId !== currentUserId && m.status === 'active'
  )

  const form = useForm<LoanApplicationValues>({
    resolver: zodResolver(loanApplicationSchema),
    defaultValues: { principal: 0, notes: '', guarantorIds: [] },
  })

  const selectedGuarantors = form.watch('guarantorIds')

  function toggleGuarantor(id: string) {
    const current = form.getValues('guarantorIds')
    form.setValue(
      'guarantorIds',
      current.includes(id) ? current.filter((g) => g !== id) : [...current, id]
    )
  }

  async function onSubmit(values: LoanApplicationValues) {
    try {
      await applyForLoan.mutateAsync({
        groupId,
        principal:    Math.round(values.principal * 100),
        guarantorIds: values.guarantorIds,
        notes:        values.notes || undefined,
      })
      toast.success('Loan application submitted')
      onDone()
    } catch (err) {
      toast.error((err as { message: string }).message)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="bg-slate-900 border border-teal-800/40 rounded-xl p-5 space-y-5"
      >
        <h3 className="text-sm font-medium text-teal-300">Apply for a loan</h3>

        {rules && (
          <div className="flex flex-wrap gap-4 text-xs text-slate-400 bg-slate-800/60 rounded-lg px-3 py-2">
            <span>Rate: <span className="text-slate-200">{rules.loanInterestRate}% / yr ({rules.loanInterestType.replace('_', ' ')})</span></span>
            <span>Max: <span className="text-slate-200">{rules.maxLoanMultiplier}× contributions</span></span>
            <span>Periods: <span className="text-slate-200">{rules.loanRepaymentPeriods} months</span></span>
          </div>
        )}

        <FormField control={form.control} name="principal" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-slate-300 text-xs">Loan amount ({currency})</FormLabel>
            <FormControl>
              <Input
                type="number" step="0.01" min="0" placeholder="0.00"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                className="bg-slate-800 border-slate-700 text-slate-100 focus-visible:ring-teal-500"
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )} />

        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-slate-300 text-xs">Purpose / notes (optional)</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g. School fees, business expansion…"
                {...field}
                className="bg-slate-800 border-slate-700 text-slate-100 focus-visible:ring-teal-500"
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )} />

        {/* Guarantor selection */}
        {rules?.guarantorRequired && otherMembers.length > 0 && (
          <div>
            <p className="text-xs text-slate-300 mb-2">
              Guarantors — select at least {rules.guarantorsRequiredCount}
            </p>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {otherMembers.map((m) => {
                const name     = m.profile?.preferredName ?? m.profile?.fullLegalName ?? 'Unknown'
                const initials = name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join('')
                const selected = selectedGuarantors.includes(m.profileId)
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleGuarantor(m.profileId)}
                    className={[
                      'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors',
                      selected
                        ? 'bg-teal-900/40 border border-teal-700'
                        : 'bg-slate-800/60 border border-transparent hover:border-slate-700',
                    ].join(' ')}
                  >
                    <Avatar className="h-6 w-6 shrink-0">
                      <AvatarFallback className="bg-slate-700 text-slate-300 text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-slate-200 flex-1">{name}</span>
                    <span className="text-xs text-slate-500">Score {m.profile?.creditScore ?? '—'}</span>
                    {selected && <span className="text-xs text-teal-400">✓</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={applyForLoan.isPending}
            className="bg-teal-600 hover:bg-teal-500 text-white text-sm">
            {applyForLoan.isPending ? 'Submitting…' : 'Submit application'}
          </Button>
          <Button type="button" variant="ghost" onClick={onDone}
            className="text-slate-400 hover:text-slate-200 text-sm">
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}

// ─── Guarantor request banner ─────────────────────────────────────────────────

function GuarantorRequestBanner({ groupId }: { groupId: string }) {
  const { data: requests = [] } = useMyGuarantorRequests()
  const respond = useRespondToGuarantor()

  const groupRequests = requests.filter((r) => r.loan?.groupId === groupId)
  if (!groupRequests.length) return null

  return (
    <div className="bg-amber-900/20 border border-amber-800/40 rounded-xl p-4 space-y-3">
      <h3 className="text-sm font-medium text-amber-300">Guarantor requests ({groupRequests.length})</h3>
      {groupRequests.map((req) => (
        <div key={req.id} className="flex items-center gap-3 justify-between">
          <div className="text-xs text-slate-300">
            <span className="text-slate-200 font-medium">{formatCurrency(req.loan?.principal ?? 0, 'KES')}</span> loan
            — {req.loan?.borrowerProfile?.preferredName ?? 'member'}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={async () => {
                try {
                  await respond.mutateAsync({ loanId: req.loanId, accepted: true })
                  toast.success('Guarantee accepted')
                } catch (err) {
                  toast.error((err as { message: string }).message)
                }
              }}
              disabled={respond.isPending}
              className="h-7 px-2 bg-teal-700 hover:bg-teal-600 text-white text-xs"
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                try {
                  await respond.mutateAsync({ loanId: req.loanId, accepted: false })
                  toast.success('Guarantee declined')
                } catch (err) {
                  toast.error((err as { message: string }).message)
                }
              }}
              disabled={respond.isPending}
              className="h-7 px-2 text-red-400 hover:text-red-300 text-xs"
            >
              Decline
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main tab ─────────────────────────────────────────────────────────────────

const STATUS_FILTERS: { value: LoanStatus | 'all'; label: string }[] = [
  { value: 'all',       label: 'All' },
  { value: 'applied',   label: 'Applications' },
  { value: 'approved',  label: 'Approved' },
  { value: 'disbursed', label: 'Disbursed' },
  { value: 'repaying',  label: 'Repaying' },
  { value: 'completed', label: 'Completed' },
]

interface LoansTabProps {
  groupId: string
  currency: string
  myMembership: GroupMember | null
  currentUserId: string
}

export function LoansTab({ groupId, currency, myMembership, currentUserId }: LoansTabProps) {
  const { data: rules } = useGroupRules(groupId)
  const [statusFilter, setStatusFilter] = useState<LoanStatus | 'all'>('all')
  const [showApply, setShowApply] = useState(false)

  const { data: loans = [], isLoading } = useGroupLoans(
    groupId,
    statusFilter !== 'all' ? statusFilter : undefined
  )

  const isMember  = !!myMembership && myMembership.status === 'active'
  const canApply  = isMember && rules?.loanEnabled

  return (
    <div className="space-y-5">
      {/* Guarantor request banner — always visible to active members */}
      {isMember && <GuarantorRequestBanner groupId={groupId} />}

      {/* Apply button */}
      {canApply && !showApply && (
        <Button
          onClick={() => setShowApply(true)}
          className="bg-teal-600 hover:bg-teal-500 text-white gap-2"
        >
          <Plus size={15} /> Apply for a loan
        </Button>
      )}

      {/* Application form */}
      {showApply && myMembership && (
        <LoanApplicationPanel
          groupId={groupId}
          currency={currency}
          currentUserId={currentUserId}
          myMembership={myMembership}
          onDone={() => setShowApply(false)}
        />
      )}

      {/* Status filter tabs */}
      <div className="flex gap-1 overflow-x-auto">
        {STATUS_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={[
              'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
              statusFilter === value
                ? 'bg-teal-700 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Loan list */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-slate-900 border border-slate-800 rounded-xl" />)}
        </div>
      ) : !loans.length ? (
        <EmptyState
          icon={FileText}
          title={statusFilter === 'all' ? 'No loans yet' : `No ${statusFilter} loans`}
          description={canApply ? 'Click "Apply for a loan" to submit your first application.' : undefined}
        />
      ) : (
        <div className="space-y-3">
          {loans.map((loan) => (
            <LoanCard
              key={loan.id}
              loan={loan}
              groupId={groupId}
              currency={currency}
              myMembership={myMembership}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}

    </div>
  )
}
