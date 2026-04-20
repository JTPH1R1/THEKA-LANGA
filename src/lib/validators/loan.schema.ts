import { z } from 'zod'

export const loanApplicationSchema = z.object({
  principal: z
    .number({ required_error: 'Loan amount is required' })
    .positive('Amount must be greater than 0'),
  notes: z.string().max(500).optional(),
  guarantorIds: z.array(z.string().uuid()).default([]),
})

export type LoanApplicationValues = z.infer<typeof loanApplicationSchema>

export const loanRepaymentSchema = z.object({
  amountPaid: z
    .number({ required_error: 'Amount is required' })
    .positive('Amount must be greater than 0'),
  paymentRef: z.string().min(1, 'Payment reference is required').max(100),
  paymentChannel: z.enum(['mobile_money', 'bank', 'cash', 'internal'], {
    required_error: 'Payment channel is required',
  }),
  notes: z.string().max(500).optional(),
})

export type LoanRepaymentValues = z.infer<typeof loanRepaymentSchema>

export const rejectLoanSchema = z.object({
  reason: z.string().min(1, 'Reason is required').max(500),
})

export type RejectLoanValues = z.infer<typeof rejectLoanSchema>

export const PAYMENT_CHANNEL_LABELS: Record<string, string> = {
  mobile_money: 'Mobile Money',
  bank:         'Bank Transfer',
  cash:         'Cash',
  internal:     'Internal Transfer',
}

export const LOAN_STATUS_LABELS: Record<string, string> = {
  applied:      'Applied',
  under_review: 'Under Review',
  approved:     'Approved',
  rejected:     'Rejected',
  disbursed:    'Disbursed',
  repaying:     'Repaying',
  completed:    'Completed',
  defaulted:    'Defaulted',
  written_off:  'Written Off',
}
