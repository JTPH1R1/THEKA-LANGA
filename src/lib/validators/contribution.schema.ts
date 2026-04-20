import { z } from 'zod'

// Amounts entered in display units (e.g. KES 100.00), converted to cents on submit

export const recordPaymentSchema = z.object({
  paidAmount: z
    .number({ required_error: 'Amount is required' })
    .positive('Amount must be greater than 0'),
  fineAmount: z
    .number()
    .min(0, 'Fine cannot be negative')
    .default(0),
  paymentRef: z
    .string()
    .min(1, 'Payment reference is required')
    .max(100),
  paymentChannel: z.enum(['mobile_money', 'bank', 'cash', 'internal'], {
    required_error: 'Payment channel is required',
  }),
  notes: z.string().max(500).optional(),
})

export type RecordPaymentValues = z.infer<typeof recordPaymentSchema>

export const generateScheduleSchema = z.object({
  cyclePeriod: z
    .string()
    .regex(/^\d{4}-\d{2}$|^\d{4}-W\d{2}$/, 'Use YYYY-MM (monthly) or YYYY-W## (weekly)'),
  dueDate: z.string().min(1, 'Due date is required'),
})

export type GenerateScheduleValues = z.infer<typeof generateScheduleSchema>

export const waiveContributionSchema = z.object({
  reason: z.string().min(1, 'Reason is required').max(500),
})

export type WaiveContributionValues = z.infer<typeof waiveContributionSchema>

export const PAYMENT_CHANNEL_LABELS: Record<string, string> = {
  mobile_money: 'Mobile Money',
  bank:         'Bank Transfer',
  cash:         'Cash',
  internal:     'Internal Transfer',
}
