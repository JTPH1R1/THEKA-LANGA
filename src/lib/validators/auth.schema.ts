import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const magicLinkSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})

export const registerSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  fullLegalName: z
    .string()
    .min(3, 'Full legal name must be at least 3 characters')
    .max(100, 'Full legal name is too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name may only contain letters, spaces, hyphens, and apostrophes'),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms to continue' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const resetPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})

export const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type LoginFormValues = z.infer<typeof loginSchema>
export type MagicLinkFormValues = z.infer<typeof magicLinkSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
export type NewPasswordFormValues = z.infer<typeof newPasswordSchema>
