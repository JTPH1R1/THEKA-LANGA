import { z } from 'zod'

// ─── Transaction ──────────────────────────────────────────────────────────────

export const TRANSACTION_TYPES = ['income', 'expense', 'transfer'] as const

export const INCOME_CATEGORIES = [
  'salary', 'business', 'investment', 'rental', 'freelance', 'gift', 'other_income',
] as const

export const EXPENSE_CATEGORIES = [
  'food', 'transport', 'rent', 'utilities', 'education', 'health',
  'entertainment', 'clothing', 'savings', 'loan_repayment', 'other',
] as const

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES] as const

export const CATEGORY_LABELS: Record<string, string> = {
  salary:         'Salary',
  business:       'Business',
  investment:     'Investment',
  rental:         'Rental',
  freelance:      'Freelance',
  gift:           'Gift',
  other_income:   'Other Income',
  food:           'Food & Groceries',
  transport:      'Transport',
  rent:           'Rent / Housing',
  utilities:      'Utilities',
  education:      'Education',
  health:         'Health',
  entertainment:  'Entertainment',
  clothing:       'Clothing',
  savings:        'Savings',
  loan_repayment: 'Loan Repayment',
  other:          'Other',
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash:         'Cash',
  mobile_money: 'Mobile Money',
  bank:         'Bank',
  card:         'Card',
  other:        'Other',
}

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer'], { required_error: 'Type is required' }),
  category: z.string().min(1, 'Category is required'),
  amount: z.number({ required_error: 'Amount is required' }).positive('Amount must be greater than 0'),
  description: z.string().max(500).optional(),
  date: z.string().min(1, 'Date is required'),
  paymentMethod: z.enum(['cash', 'mobile_money', 'bank', 'card', 'other']).optional(),
  tags: z.array(z.string()).default([]),
})

export type TransactionValues = z.infer<typeof transactionSchema>

// ─── Budget ───────────────────────────────────────────────────────────────────

export const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  budgetedAmount: z.number({ required_error: 'Amount is required' }).positive('Must be greater than 0'),
  notes: z.string().max(500).optional(),
})

export type BudgetValues = z.infer<typeof budgetSchema>

// ─── Shopping list ────────────────────────────────────────────────────────────

export const shoppingListSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  plannedDate: z.string().optional(),
})

export type ShoppingListValues = z.infer<typeof shoppingListSchema>

export const shoppingItemSchema = z.object({
  name: z.string().min(1, 'Item name is required').max(200),
  quantity: z.number().positive().default(1),
  unit: z.string().max(20).optional(),
  estimatedPrice: z.number().min(0).optional(),
  category: z.string().optional(),
})

export type ShoppingItemValues = z.infer<typeof shoppingItemSchema>
