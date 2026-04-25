import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

import { AuthLayout } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { newPasswordSchema } from '@/lib/validators/auth.schema'
import { useUpdatePassword } from '@/hooks/useAuth'
import type { NewPasswordFormValues } from '@/lib/validators/auth.schema'

export function NewPasswordPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [done, setDone] = useState(false)
  const navigate = useNavigate()
  const updatePassword = useUpdatePassword()

  const form = useForm<NewPasswordFormValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const password = form.watch('password')

  async function handleSubmit(values: NewPasswordFormValues) {
    try {
      await updatePassword.mutateAsync({ password: values.password })
      setDone(true)
      toast.success('Password updated successfully')
    } catch (err) {
      const msg = (err as { message: string }).message
      form.setError('root', { message: msg })
    }
  }

  if (done) {
    return (
      <AuthLayout title="Password updated" description="Your new password is set">
        <div className="text-center space-y-4 py-2">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-teal-100/50 mx-auto">
            <CheckCircle2 className="text-teal-600" size={28} />
          </div>
          <p className="text-sm text-slate-700">
            Your password has been updated. You can now sign in with your new password.
          </p>
          <Button
            className="w-full bg-teal-600 hover:bg-teal-500 text-white mt-2"
            onClick={() => navigate('/auth/login')}
          >
            Sign in
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Set new password" description="Choose a strong password for your account">
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {form.formState.errors.root && (
          <Alert variant="destructive">
            <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-slate-700">New password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              className="bg-gray-100 border-gray-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500 pr-10"
              {...form.register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {password.length > 0 && (
            <ul className="space-y-0.5 mt-1">
              {[
                { ok: password.length >= 8, label: 'At least 8 characters' },
                { ok: /[A-Z]/.test(password), label: 'One uppercase letter' },
                { ok: /[0-9]/.test(password), label: 'One number' },
              ].map(({ ok, label }) => (
                <li
                  key={label}
                  className={`text-xs flex items-center gap-1.5 ${ok ? 'text-teal-600' : 'text-slate-400'}`}
                >
                  <span>{ok ? '✓' : '○'}</span>
                  {label}
                </li>
              ))}
            </ul>
          )}
          {form.formState.errors.password && (
            <p className="text-xs text-red-400">{form.formState.errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-slate-700">Confirm password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Re-enter your new password"
              className="bg-gray-100 border-gray-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500 pr-10"
              {...form.register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {form.formState.errors.confirmPassword && (
            <p className="text-xs text-red-400">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-teal-600 hover:bg-teal-500 text-white"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </AuthLayout>
  )
}
