import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import {
  recordPaymentSchema,
  type RecordPaymentValues,
  PAYMENT_CHANNEL_LABELS,
} from '@/lib/validators/contribution.schema'
import { useRecordContributionPayment } from '@/hooks/useContributions'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Contribution } from '@/types/domain.types'

interface Props {
  contribution: Contribution
  groupId: string
  currency: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RecordPaymentDialog({ contribution, groupId, currency, open, onOpenChange }: Props) {
  const recordPayment = useRecordContributionPayment(groupId)

  const memberName =
    contribution.profile?.preferredName ??
    contribution.profile?.fullLegalName ??
    'Member'

  const form = useForm<RecordPaymentValues>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      paidAmount:     contribution.expectedAmount / 100,
      fineAmount:     0,
      paymentRef:     '',
      paymentChannel: 'mobile_money',
      notes:          '',
    },
  })

  // Reset when a different contribution is opened
  useEffect(() => {
    if (open) {
      form.reset({
        paidAmount:     contribution.expectedAmount / 100,
        fineAmount:     0,
        paymentRef:     '',
        paymentChannel: 'mobile_money',
        notes:          '',
      })
    }
  }, [open, contribution.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(values: RecordPaymentValues) {
    try {
      await recordPayment.mutateAsync({
        contributionId: contribution.id,
        paidAmount:     Math.round(values.paidAmount * 100),
        fineAmount:     Math.round(values.fineAmount * 100),
        paymentRef:     values.paymentRef,
        paymentChannel: values.paymentChannel,
        notes:          values.notes || undefined,
      })
      toast.success('Payment recorded')
      onOpenChange(false)
    } catch (err) {
      toast.error((err as { message: string }).message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Record Payment — {memberName}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-800/60 rounded-lg px-3 py-2 mb-2">
          <span>Expected: <span className="text-slate-200 font-medium">{formatCurrency(contribution.expectedAmount, currency)}</span></span>
          <span>Due: {formatDate(contribution.dueDate)}</span>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="paidAmount" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300 text-xs">Amount paid ({currency})</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      className="bg-slate-800 border-slate-700 text-slate-100 focus-visible:ring-teal-500"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />

              <FormField control={form.control} name="fineAmount" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300 text-xs">Fine / penalty ({currency})</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      className="bg-slate-800 border-slate-700 text-slate-100 focus-visible:ring-teal-500"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="paymentRef" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300 text-xs">Payment reference</FormLabel>
                <FormControl>
                  <Input
                    placeholder="M-Pesa ref, bank ref, etc."
                    {...field}
                    className="bg-slate-800 border-slate-700 text-slate-100 focus-visible:ring-teal-500"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )} />

            <FormField control={form.control} name="paymentChannel" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300 text-xs">Payment channel</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full rounded-md bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    {Object.entries(PAYMENT_CHANNEL_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )} />

            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300 text-xs">Notes (optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Any additional notes…"
                    {...field}
                    className="bg-slate-800 border-slate-700 text-slate-100 focus-visible:ring-teal-500"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )} />

            <div className="flex gap-2 pt-1">
              <Button
                type="submit"
                disabled={recordPayment.isPending}
                className="bg-teal-600 hover:bg-teal-500 text-white flex-1"
              >
                {recordPayment.isPending ? 'Recording…' : 'Record Payment'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
