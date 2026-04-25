import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ChevronDown, CheckCircle2, XCircle } from 'lucide-react'

import {
  useApproveLoan, useRejectLoan, useDisburseLoan,
  useRecordLoanRepayment, useLoanGuarantors, useLoanRepayments,
} from '@/hooks/useLoans'
import {
  loanRepaymentSchema, rejectLoanSchema,
  type LoanRepaymentValues, type RejectLoanValues,
  PAYMENT_CHANNEL_LABELS,
} from '@/lib/validators/loan.schema'
import { LoanStatusBadge } from '@/components/loans/LoanStatusBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatCurrency, formatDate } from '@/lib/formatters'
import type { Loan, GroupMember } from '@/types/domain.types'

// ─── Reject dialog (needs a reason input) ────────────────────────────────────

function RejectDialog({
  loan, groupId, open, onOpenChange,
}: {
  loan: Loan; groupId: string; open: boolean; onOpenChange: (v: boolean) => void
}) {
  const reject = useRejectLoan(groupId)
  const form = useForm<RejectLoanValues>({ resolver: zodResolver(rejectLoanSchema), defaultValues: { reason: '' } })

  async function onSubmit(values: RejectLoanValues) {
    try {
      await reject.mutateAsync({ loanId: loan.id, reason: values.reason })
      toast.success('Loan rejected')
      onOpenChange(false)
      form.reset()
    } catch (err) {
      toast.error((err as { message: string }).message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-gray-200 text-slate-900 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-slate-900">Reject loan application?</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="reason" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 text-xs">Reason (required — shown to applicant)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Insufficient contribution history" {...field}
                    className="bg-gray-100 border-gray-300 text-slate-900" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )} />
            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}
                className="text-slate-400 hover:text-slate-800">Cancel</Button>
              <Button type="submit" disabled={reject.isPending}
                className="bg-red-700 hover:bg-red-600 text-white">
                {reject.isPending ? 'Please wait…' : 'Reject'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Repayment dialog ─────────────────────────────────────────────────────────

function RepaymentDialog({
  loan, groupId, open, onOpenChange,
}: {
  loan: Loan; groupId: string; open: boolean; onOpenChange: (v: boolean) => void
}) {
  const recordRepayment = useRecordLoanRepayment(groupId, loan.id)
  const { data: repayments = [] } = useLoanRepayments(loan.id)

  const form = useForm<LoanRepaymentValues>({
    resolver: zodResolver(loanRepaymentSchema),
    defaultValues: { amountPaid: loan.outstanding / 100, paymentRef: '', paymentChannel: 'mobile_money', notes: '' },
  })

  async function onSubmit(values: LoanRepaymentValues) {
    try {
      await recordRepayment.mutateAsync({
        loanId:         loan.id,
        amountPaid:     Math.round(values.amountPaid * 100),
        paymentRef:     values.paymentRef,
        paymentChannel: values.paymentChannel,
        notes:          values.notes || undefined,
      })
      toast.success('Repayment recorded')
      onOpenChange(false)
    } catch (err) {
      toast.error((err as { message: string }).message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-gray-200 text-slate-900 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-900">Record Repayment</DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 text-xs text-slate-400 bg-gray-100 rounded-lg px-3 py-2 mb-2">
          <span>Outstanding: <span className="text-red-300 font-medium">{formatCurrency(loan.outstanding, 'KES')}</span></span>
          <span>Total: {formatCurrency(loan.totalRepayable, 'KES')}</span>
          <span>Repaid: {formatCurrency(loan.amountRepaid, 'KES')}</span>
        </div>

        {repayments.length > 0 && (
          <div className="space-y-1 max-h-28 overflow-y-auto">
            {repayments.slice(0, 5).map((r) => (
              <div key={r.id} className="flex justify-between text-xs text-slate-400">
                <span>{formatDate(r.paidAt)} — {r.paymentRef}</span>
                <span className="text-teal-700">{formatCurrency(r.amountPaid, 'KES')}</span>
              </div>
            ))}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="amountPaid" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 text-xs">Amount (KES)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" placeholder="0.00"
                      {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      className="bg-gray-100 border-gray-300 text-slate-900 focus-visible:ring-teal-500" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />
              <FormField control={form.control} name="paymentChannel" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 text-xs">Channel</FormLabel>
                  <FormControl>
                    <select {...field}
                      className="w-full rounded-md bg-gray-100 border border-gray-300 text-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500">
                      {Object.entries(PAYMENT_CHANNEL_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </FormControl>
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="paymentRef" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 text-xs">Payment reference</FormLabel>
                <FormControl>
                  <Input placeholder="M-Pesa ref, bank ref…" {...field}
                    className="bg-gray-100 border-gray-300 text-slate-900 focus-visible:ring-teal-500" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )} />
            <div className="flex gap-2">
              <Button type="submit" disabled={recordRepayment.isPending}
                className="bg-teal-600 hover:bg-teal-500 text-white flex-1">
                {recordRepayment.isPending ? 'Recording…' : 'Record Repayment'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}
                className="text-slate-400 hover:text-slate-800">Cancel</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Loan card ────────────────────────────────────────────────────────────────

interface LoanCardProps {
  loan: Loan
  groupId: string
  currency: string
  myMembership: GroupMember | null
  currentUserId: string
}

export function LoanCard({ loan, groupId, currency, myMembership, currentUserId }: LoanCardProps) {
  const [expanded,    setExpanded]    = useState(false)
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen,  setRejectOpen]  = useState(false)
  const [disburseOpen,setDisburseOpen]= useState(false)
  const [repayOpen,   setRepayOpen]   = useState(false)

  const isOfficer    = myMembership?.role === 'chair' || myMembership?.role === 'treasurer'
  const isBorrower   = loan.borrowerId === currentUserId

  const approve  = useApproveLoan(groupId)
  const disburse = useDisburseLoan(groupId)
  const { data: guarantors = [] } = useLoanGuarantors(loan.id)

  const borrowerName =
    loan.borrowerProfile?.preferredName ??
    loan.borrowerProfile?.fullLegalName ??
    'Unknown'
  const initials = borrowerName.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join('')

  const repaidPct = loan.totalRepayable > 0
    ? Math.min(100, Math.round((loan.amountRepaid / loan.totalRepayable) * 100))
    : 0

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-gray-200 text-slate-700 text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-slate-800">{borrowerName}</span>
            {isBorrower && <span className="text-xs text-slate-400">(you)</span>}
            <LoanStatusBadge status={loan.status} />
          </div>
          <div className="flex gap-3 text-xs text-slate-400 mt-0.5">
            <span>{formatCurrency(loan.principal, currency)} principal</span>
            {loan.dueDate && <span>due {formatDate(loan.dueDate)}</span>}
          </div>
        </div>
        {['disbursed','repaying'].includes(loan.status) && (
          <div className="text-right shrink-0 mr-2">
            <p className="text-xs text-slate-400">{repaidPct}% repaid</p>
            <div className="w-20 h-1.5 bg-gray-200 rounded-full mt-1">
              <div
                className="h-full bg-teal-500 rounded-full transition-all"
                style={{ width: `${repaidPct}%` }}
              />
            </div>
          </div>
        )}
        <ChevronDown size={16} className={`text-slate-400 transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-200 space-y-4">
          {/* Financials grid */}
          <div className="grid grid-cols-3 gap-3 pt-3">
            {[
              { label: 'Principal',    value: formatCurrency(loan.principal,      currency) },
              { label: 'Interest',     value: formatCurrency(loan.totalInterest,  currency) },
              { label: 'Processing',   value: formatCurrency(loan.processingFee,  currency) },
              { label: 'Total repay',  value: formatCurrency(loan.totalRepayable, currency) },
              { label: 'Repaid',       value: formatCurrency(loan.amountRepaid,   currency) },
              { label: 'Outstanding',  value: formatCurrency(loan.outstanding,    currency) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-100 rounded-lg p-2.5">
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-sm font-semibold text-slate-800 tabular-nums">{value}</p>
              </div>
            ))}
          </div>

          {/* Guarantors */}
          {guarantors.length > 0 && (
            <div>
              <p className="text-xs text-slate-400 mb-2">Guarantors</p>
              <div className="flex flex-wrap gap-2">
                {guarantors.map((g) => {
                  const gName = g.profile?.preferredName ?? g.profile?.fullLegalName ?? 'Unknown'
                  return (
                    <div key={g.id} className="flex items-center gap-1.5 text-xs">
                      <span className={
                        g.status === 'accepted' ? 'text-teal-600' :
                        g.status === 'declined' ? 'text-red-400' : 'text-amber-600'
                      }>
                        {g.status === 'accepted' ? <CheckCircle2 size={12} className="inline" /> :
                         g.status === 'declined' ? <XCircle size={12} className="inline" /> : '●'}
                      </span>
                      <span className="text-slate-700">{gName}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Notes */}
          {loan.notes && <p className="text-xs text-slate-400">{loan.notes}</p>}
          {loan.rejectionReason && (
            <p className="text-xs text-red-400">Rejected: {loan.rejectionReason}</p>
          )}

          {/* Officer actions */}
          <div className="flex flex-wrap gap-2 pt-1">
            {isOfficer && loan.status === 'applied' && (
              <>
                <Button size="sm" onClick={() => setApproveOpen(true)}
                  className="h-7 px-3 bg-teal-700 hover:bg-teal-600 text-white text-xs gap-1">
                  <CheckCircle2 size={12} /> Approve
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setRejectOpen(true)}
                  className="h-7 px-3 text-red-400 hover:text-red-300 text-xs gap-1">
                  <XCircle size={12} /> Reject
                </Button>
              </>
            )}
            {isOfficer && loan.status === 'approved' && (
              <Button size="sm" onClick={() => setDisburseOpen(true)}
                className="h-7 px-3 bg-indigo-700 hover:bg-indigo-600 text-white text-xs">
                Mark as Disbursed
              </Button>
            )}
            {isOfficer && ['disbursed','repaying'].includes(loan.status) && (
              <Button size="sm" onClick={() => setRepayOpen(true)}
                className="h-7 px-3 bg-blue-700 hover:bg-blue-600 text-white text-xs">
                Record Repayment
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Dialogs */}
      <ConfirmDialog
        open={approveOpen} onOpenChange={setApproveOpen}
        title="Approve this loan?"
        description={`Approve ${formatCurrency(loan.principal, currency)} loan for ${borrowerName}?`}
        confirmLabel="Approve"
        isPending={approve.isPending}
        onConfirm={async () => {
          try {
            await approve.mutateAsync(loan.id)
            toast.success('Loan approved')
            setApproveOpen(false)
          } catch (err) {
            toast.error((err as { message: string }).message)
          }
        }}
      />
      <ConfirmDialog
        open={disburseOpen} onOpenChange={setDisburseOpen}
        title="Mark loan as disbursed?"
        description="This confirms the funds have been transferred to the borrower. Repayments can be recorded after this step."
        confirmLabel="Mark disbursed"
        isPending={disburse.isPending}
        onConfirm={async () => {
          try {
            await disburse.mutateAsync(loan.id)
            toast.success('Loan marked as disbursed')
            setDisburseOpen(false)
          } catch (err) {
            toast.error((err as { message: string }).message)
          }
        }}
      />
      <RejectDialog
        loan={loan} groupId={groupId}
        open={rejectOpen} onOpenChange={setRejectOpen}
      />
      <RepaymentDialog
        loan={loan} groupId={groupId}
        open={repayOpen} onOpenChange={setRepayOpen}
      />
    </div>
  )
}
