import { z } from 'zod'

export const level1Schema = z.object({
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date (YYYY-MM-DD)')
    .refine((d) => {
      const age = (Date.now() - new Date(d).getTime()) / (365.25 * 24 * 3600 * 1000)
      return age >= 18
    }, 'You must be 18 or older'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say'], {
    errorMap: () => ({ message: 'Select a gender' }),
  }),
  nationality: z.string().min(2, 'Select nationality'),
})

const MAX_DOC_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

const fileSchema = z
  .instanceof(File)
  .refine((f) => f.size <= MAX_DOC_SIZE, 'File must be under 10 MB')
  .refine((f) => ALLOWED_TYPES.includes(f.type), 'Only JPG, PNG, WebP, or PDF accepted')

export const level2Schema = z.object({
  // ID document
  docType: z.enum([
    'national_id', 'passport', 'drivers_license',
    'alien_card', 'military_id', 'voters_card',
  ], { errorMap: () => ({ message: 'Select a document type' }) }),
  docNumber: z.string().min(4, 'Enter the document number'),
  issuingCountry: z.string().min(2, 'Select issuing country'),
  docFullName: z.string().min(3, 'Enter name as it appears on the document'),
  expiryDate: z.string().optional(),
  frontImage: fileSchema,
  backImage: fileSchema.optional(),
  // Selfie
  selfieImage: fileSchema,
  // Next of kin
  nokFullName: z.string().min(3, 'Enter full name of your next of kin'),
  nokRelationship: z.enum([
    'spouse', 'parent', 'sibling', 'child', 'friend', 'colleague', 'guardian', 'other',
  ], { errorMap: () => ({ message: 'Select a relationship' }) }),
  nokPhone: z
    .string()
    .regex(/^\+[1-9]\d{7,14}$/, 'Enter phone in international format e.g. +254712345678'),
})

export const level3Schema = z.object({
  // Address
  addressLine1: z.string().min(5, 'Enter your street address'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'Enter your city'),
  countyProvince: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().min(2, 'Select country').default('KE'),
  proofDocType: z.enum([
    'utility_bill', 'bank_statement', 'lease_agreement', 'official_letter', 'rates_receipt',
  ], { errorMap: () => ({ message: 'Select proof document type' }) }),
  proofPeriod: z.string().min(3, 'e.g. March 2026'),
  proofImage: fileSchema,
  // Financial declaration
  employmentStatus: z.enum([
    'employed_full_time', 'employed_part_time', 'self_employed',
    'business_owner', 'unemployed', 'student', 'retired', 'other',
  ], { errorMap: () => ({ message: 'Select employment status' }) }),
  monthlyIncomeBand: z.enum([
    'below_10k', '10k_25k', '25k_50k', '50k_100k', '100k_250k', 'above_250k',
  ], { errorMap: () => ({ message: 'Select income band' }) }),
  sourceOfFunds: z.array(z.string()).min(1, 'Select at least one source of funds'),
  taxIdNumber: z.string().optional(),
  isPep: z.boolean(),
  usPerson: z.boolean(),
  declarationAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the declaration to proceed' }),
  }),
})

export type Level1FormValues = z.infer<typeof level1Schema>
export type Level2FormValues = z.infer<typeof level2Schema>
export type Level3FormValues = z.infer<typeof level3Schema>

// Display labels
export const DOC_TYPE_LABELS: Record<string, string> = {
  national_id: 'National ID',
  passport: 'Passport',
  drivers_license: "Driver's License",
  alien_card: 'Alien Card / Foreign Resident ID',
  military_id: 'Military ID',
  voters_card: "Voter's Card",
}

export const EMPLOYMENT_STATUS_LABELS: Record<string, string> = {
  employed_full_time: 'Employed (full-time)',
  employed_part_time: 'Employed (part-time)',
  self_employed: 'Self-employed',
  business_owner: 'Business owner',
  unemployed: 'Unemployed',
  student: 'Student',
  retired: 'Retired',
  other: 'Other',
}

export const INCOME_BAND_LABELS: Record<string, string> = {
  below_10k: 'Below KES 10,000',
  '10k_25k': 'KES 10,000 – 25,000',
  '25k_50k': 'KES 25,000 – 50,000',
  '50k_100k': 'KES 50,000 – 100,000',
  '100k_250k': 'KES 100,000 – 250,000',
  above_250k: 'Above KES 250,000',
}

export const SOURCE_OF_FUNDS_OPTIONS = [
  { value: 'salary',      label: 'Salary / Employment' },
  { value: 'business',    label: 'Business income' },
  { value: 'investment',  label: 'Investments / dividends' },
  { value: 'inheritance', label: 'Inheritance / gift' },
  { value: 'remittance',  label: 'Remittance' },
  { value: 'other',       label: 'Other' },
] as const

export const AFRICAN_COUNTRIES = [
  { value: 'KE', label: 'Kenya' },
  { value: 'TZ', label: 'Tanzania' },
  { value: 'UG', label: 'Uganda' },
  { value: 'RW', label: 'Rwanda' },
  { value: 'ET', label: 'Ethiopia' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'GH', label: 'Ghana' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'ZM', label: 'Zambia' },
  { value: 'ZW', label: 'Zimbabwe' },
  { value: 'MZ', label: 'Mozambique' },
  { value: 'SS', label: 'South Sudan' },
  { value: 'SO', label: 'Somalia' },
  { value: 'CD', label: 'DR Congo' },
  { value: 'CM', label: 'Cameroon' },
  { value: 'SN', label: 'Senegal' },
  { value: 'CI', label: "Côte d'Ivoire" },
  { value: 'EG', label: 'Egypt' },
  { value: 'MA', label: 'Morocco' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'US', label: 'United States' },
  { value: 'AE', label: 'UAE' },
  { value: 'OTHER', label: 'Other' },
] as const
