import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'

import { AuthLayout } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { resetPasswordSchema } from '@/lib/validators/auth.schema'
import { useResetPassword } from '@/hooks/useAuth'
import type { ResetPasswordFormValues } from '@/lib/validators/auth.schema'

export function ResetPasswordPage() {
  const [sent, setSent] = useState(false)
  const resetPassword = useResetPassword()

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: '' },
  })

  async function handleSubmit(values: ResetPasswordFormValues) {
    try {
      await resetPassword.mutateAsync({ email: values.email })
      setSent(true)
    } catch (err) {
      const msg = (err as { message: string }).message
      form.setError('root', { message: msg })
    }
  }

  if (sent) {
    return (
      <AuthLayout title="Check your email" description="Password reset instructions sent">
        <div className="text-center space-y-4 py-2">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-teal-100/50 mx-auto">
            <Mail className="text-teal-600" size={28} />
          </div>
          <p className="text-sm text-slate-700">
            If{' '}
            <span className="text-slate-900 font-medium">{form.getValues('email')}</span>{' '}
            is registered, you&apos;ll receive a reset link within a few minutes.
          </p>
          <p className="text-xs text-slate-400">Check your spam folder if you don&apos;t see it.</p>
          <Link
            to="/auth/login"
            className="block text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors mt-4"
          >
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Reset password"
      description="Enter your email and we'll send you a reset link"
    >
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {form.formState.errors.root && (
          <Alert variant="destructive">
            <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-slate-700">Email address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="bg-gray-100 border-gray-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500"
            {...form.register('email')}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-red-400">{form.formState.errors.email.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-teal-600 hover:bg-teal-500 text-white"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Sending…' : 'Send reset link'}
        </Button>

        <p className="text-center text-sm text-slate-400 pt-2">
          <Link
            to="/auth/login"
            className="text-teal-600 hover:text-teal-700 transition-colors"
          >
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
