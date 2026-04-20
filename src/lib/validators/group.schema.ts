import { z } from 'zod'

export const groupInfoSchema = z.object({
  name: z.string().min(3, 'Group name must be at least 3 characters').max(80, 'Too long'),
  type: z.enum(['public', 'private'], { errorMap: () => ({ message: 'Select group type' }) }),
  description: z.string().max(500, 'Max 500 characters').optional(),
  currency: z.string().min(3).max(3).default('KES'),
  timezone: z.string().default('Africa/Nairobi'),
  cycleStart: z.string().optional(),
  cycleEnd: z.string().optional(),
}).refine(
  (d) => {
    if (d.cycleStart && d.cycleEnd) return new Date(d.cycleEnd) > new Date(d.cycleStart)
    return true
  },
  { message: 'Cycle end must be after cycle start', path: ['cycleEnd'] },
)

export type GroupInfoValues = z.infer<typeof groupInfoSchema>

export const CURRENCY_OPTIONS = [
  { value: 'KES', label: 'KES — Kenyan Shilling' },
  { value: 'TZS', label: 'TZS — Tanzanian Shilling' },
  { value: 'UGX', label: 'UGX — Ugandan Shilling' },
  { value: 'RWF', label: 'RWF — Rwandan Franc' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'AED', label: 'AED — UAE Dirham' },
] as const

/** Derive a URL-safe slug from a group name */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
}
