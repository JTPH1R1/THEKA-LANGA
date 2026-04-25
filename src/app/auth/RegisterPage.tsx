import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react'

import { AuthLayout } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { registerSchema } from '@/lib/validators/auth.schema'
import { useRegister } from '@/hooks/useAuth'
import type { RegisterFormValues } from '@/lib/validators/auth.schema'

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const navigate = useNavigate()
  const register = useRegister()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullLegalName: '',
      acceptTerms: undefined,
    },
    mode: 'onBlur',
  })

  const password = form.watch('password')

  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  }

  async function handleRegister(values: RegisterFormValues) {
    try {
      await register.mutateAsync({
        email: values.email,
        password: values.password,
        fullLegalName: values.fullLegalName,
      })
      setRegisteredEmail(values.email)
    } catch (err) {
      const msg = (err as { message: string }).message
      form.setError('root', { message: msg })
    }
  }

  if (registeredEmail) {
    return (
      <AuthLayout title="Verify your email" description="One more step to get started">
        <div className="text-center space-y-4 py-2">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-teal-100/50 mx-auto">
            <CheckCircle2 className="text-teal-600" size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-700">
              We sent a verification email to{' '}
              <span className="text-slate-900 font-medium">{registeredEmail}</span>.
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Click the link in the email to activate your account, then sign in.
            </p>
          </div>
          <Button
            className="w-full bg-teal-600 hover:bg-teal-500 text-white mt-2"
            onClick={() => navigate('/auth/login')}
          >
            Go to sign in
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Create account"
      description="Join Theka Langa — own your cooperative financial future"
    >
      <form onSubmit={form.handleSubmit(handleRegister)} className="space-y-4">
        {form.formState.errors.root && (
          <Alert variant="destructive">
            <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="fullLegalName" className="text-slate-700">
            Full legal name
          </Label>
          <Input
            id="fullLegalName"
            type="text"
            autoComplete="name"
            placeholder="As it appears on your government ID"
            className="bg-gray-100 border-gray-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500"
            {...form.register('fullLegalName')}
          />
          {form.formState.errors.fullLegalName && (
            <p className="text-xs text-red-400">{form.formState.errors.fullLegalName.message}</p>
          )}
        </div>

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

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-slate-700">Password</Label>
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
                { ok: passwordChecks.length, label: 'At least 8 characters' },
                { ok: passwordChecks.uppercase, label: 'One uppercase letter' },
                { ok: passwordChecks.number, label: 'One number' },
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
              placeholder="Re-enter your password"
              className="bg-gray-100 border-gray-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500 pr-10"
              {...form.register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800"
              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {form.formState.errors.confirmPassword && (
            <p className="text-xs text-red-400">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="flex items-start gap-2.5 pt-1">
          <input
            id="acceptTerms"
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-gray-300 bg-gray-100 accent-teal-500 cursor-pointer"
            {...form.register('acceptTerms')}
          />
          <label
            htmlFor="acceptTerms"
            className="text-xs text-slate-400 leading-relaxed cursor-pointer"
          >
            I agree to the{' '}
            <span className="text-teal-600 hover:text-teal-700 cursor-pointer">Terms of Service</span>
            {' '}and{' '}
            <span className="text-teal-600 hover:text-teal-700 cursor-pointer">Privacy Policy</span>.
            My data will be used to manage my cooperative membership.
          </label>
        </div>
        {form.formState.errors.acceptTerms && (
          <p className="text-xs text-red-400 -mt-2">{form.formState.errors.acceptTerms.message}</p>
        )}

        <Button
          type="submit"
          className="w-full bg-teal-600 hover:bg-teal-500 text-white mt-2"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <Separator className="my-6 bg-gray-100" />

      <p className="text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link
          to="/auth/login"
          className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
