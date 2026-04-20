import { z } from 'zod'

const phoneRegex = /^\+[1-9]\d{7,14}$/

export const profileSetupSchema = z.object({
  preferredName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name is too long'),
  phone: z
    .string()
    .regex(phoneRegex, 'Enter a valid phone number in international format e.g. +254712345678')
    .or(z.literal('')),
  timezone: z.string().min(1, 'Select a timezone'),
  locale: z.string().min(1, 'Select a locale'),
})

export const profileEditSchema = z.object({
  preferredName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name is too long'),
  phone: z
    .string()
    .regex(phoneRegex, 'Enter a valid phone number in international format e.g. +254712345678')
    .or(z.literal('')),
  timezone: z.string().min(1, 'Select a timezone'),
  locale: z.string().min(1, 'Select a locale'),
})

export type ProfileSetupFormValues = z.infer<typeof profileSetupSchema>
export type ProfileEditFormValues = z.infer<typeof profileEditSchema>

// Common timezone options — focused on East Africa + major global zones
export const TIMEZONE_OPTIONS = [
  { value: 'Africa/Nairobi',     label: 'East Africa Time (Nairobi) — EAT UTC+3' },
  { value: 'Africa/Dar_es_Salaam', label: 'East Africa Time (Dar es Salaam) — EAT UTC+3' },
  { value: 'Africa/Kampala',     label: 'East Africa Time (Kampala) — EAT UTC+3' },
  { value: 'Africa/Kigali',      label: 'East Africa Time (Kigali) — EAT UTC+3' },
  { value: 'Africa/Addis_Ababa', label: 'East Africa Time (Addis Ababa) — EAT UTC+3' },
  { value: 'Africa/Mogadishu',   label: 'East Africa Time (Mogadishu) — EAT UTC+3' },
  { value: 'Africa/Lagos',       label: 'West Africa Time (Lagos) — WAT UTC+1' },
  { value: 'Africa/Accra',       label: 'Ghana Mean Time (Accra) — GMT UTC+0' },
  { value: 'Africa/Johannesburg',label: 'South Africa Standard Time — SAST UTC+2' },
  { value: 'Africa/Cairo',       label: 'Eastern European Time (Cairo) — EET UTC+2' },
  { value: 'Europe/London',      label: 'Greenwich Mean Time (London) — GMT/BST' },
  { value: 'Europe/Paris',       label: 'Central European Time (Paris) — CET UTC+1' },
  { value: 'America/New_York',   label: 'Eastern Time (New York) — ET UTC-5' },
  { value: 'America/Los_Angeles',label: 'Pacific Time (Los Angeles) — PT UTC-8' },
  { value: 'Asia/Dubai',         label: 'Gulf Standard Time (Dubai) — GST UTC+4' },
  { value: 'Asia/Riyadh',        label: 'Arabia Standard Time (Riyadh) — AST UTC+3' },
  { value: 'UTC',                label: 'Universal Coordinated Time — UTC+0' },
] as const

export const LOCALE_OPTIONS = [
  { value: 'en-KE', label: 'English (Kenya)' },
  { value: 'en-TZ', label: 'English (Tanzania)' },
  { value: 'en-UG', label: 'English (Uganda)' },
  { value: 'en-RW', label: 'English (Rwanda)' },
  { value: 'en-ET', label: 'English (Ethiopia)' },
  { value: 'en-NG', label: 'English (Nigeria)' },
  { value: 'en-GH', label: 'English (Ghana)' },
  { value: 'en-ZA', label: 'English (South Africa)' },
  { value: 'en-GB', label: 'English (United Kingdom)' },
  { value: 'en-US', label: 'English (United States)' },
  { value: 'sw-KE', label: 'Swahili (Kenya)' },
  { value: 'sw-TZ', label: 'Swahili (Tanzania)' },
] as const
