import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Eye, EyeOff, Mail } from 'lucide-react'

import { AuthLayout } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { loginSchema, magicLinkSchema } from '@/lib/validators/auth.schema'
import { useSignIn, useMagicLink } from '@/hooks/useAuth'
import type { LoginFormValues, MagicLinkFormValues } from '@/lib/validators/auth.schema'

type Mode = 'password' | 'magic'

export function LoginPage() {
  const [mode, setMode] = useState<Mode>('password')
  const [showPassword, setShowPassword] = useState(false)
  const [magicSent, setMagicSent] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard'

  const signIn = useSignIn()
  const sendMagicLink = useMagicLink()

  const passwordForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const magicForm = useForm<MagicLinkFormValues>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: '' },
  })

  async function handlePasswordLogin(values: LoginFormValues) {
    try {
      await signIn.mutateAsync({ email: values.email, password: values.password })
      navigate(from, { replace: true })
    } catch (err) {
      const msg = (err as { message: string }).message
      passwordForm.setError('root', { message: msg })
    }
  }

  async function handleMagicLink(values: MagicLinkFormValues) {
    try {
      await sendMagicLink.mutateAsync({ email: values.email })
      setMagicSent(true)
    } catch (err) {
      const msg = (err as { message: string }).message
      magicForm.setError('root', { message: msg })
      toast.error(msg)
    }
  }

  return (
    <AuthLayout title="Sign in" description="Welcome back to Theka Langa">
      {/* Mode toggle */}
      <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
        <button
          type="button"
          onClick={() => setMode('password')}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
            mode === 'password'
              ? 'bg-[#1B2D6A] text-white'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => setMode('magic')}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
            mode === 'magic'
              ? 'bg-[#1B2D6A] text-white'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Magic link
        </button>
      </div>

      {/* Password form */}
      {mode === 'password' && (
        <form onSubmit={passwordForm.handleSubmit(handlePasswordLogin)} className="space-y-4">
          {passwordForm.formState.errors.root && (
            <Alert variant="destructive">
              <AlertDescription>{passwordForm.formState.errors.root.message}</AlertDescription>
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
              {...passwordForm.register('email')}
            />
            {passwordForm.formState.errors.email && (
              <p className="text-xs text-red-400">{passwordForm.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-slate-700">Password</Label>
              <Link
                to="/auth/reset-password"
                className="text-xs text-teal-600 hover:text-teal-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className="bg-gray-100 border-gray-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500 pr-10"
                {...passwordForm.register('password')}
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
            {passwordForm.formState.errors.password && (
              <p className="text-xs text-red-400">{passwordForm.formState.errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-500 text-white"
            disabled={passwordForm.formState.isSubmitting}
          >
            {passwordForm.formState.isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      )}

      {/* Magic link form */}
      {mode === 'magic' && (
        <>
          {magicSent ? (
            <div className="text-center py-4 space-y-3">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-teal-100/50 mx-auto">
                <Mail className="text-teal-600" size={24} />
              </div>
              <p className="text-sm text-slate-700 font-medium">Check your email</p>
              <p className="text-xs text-slate-400">
                We sent a sign-in link to{' '}
                <span className="text-slate-800">{magicForm.getValues('email')}</span>.
                The link expires in 10 minutes.
              </p>
              <button
                type="button"
                onClick={() => setMagicSent(false)}
                className="text-xs text-teal-600 hover:text-teal-700 underline"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={magicForm.handleSubmit(handleMagicLink)} className="space-y-4">
              {magicForm.formState.errors.root && (
                <Alert variant="destructive">
                  <AlertDescription>{magicForm.formState.errors.root.message}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="magic-email" className="text-slate-700">Email address</Label>
                <Input
                  id="magic-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="bg-gray-100 border-gray-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500"
                  {...magicForm.register('email')}
                />
                {magicForm.formState.errors.email && (
                  <p className="text-xs text-red-400">{magicForm.formState.errors.email.message}</p>
                )}
              </div>

              <p className="text-xs text-slate-400">
                We&apos;ll send a one-click sign-in link. No password needed.
              </p>

              <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-500 text-white"
                disabled={magicForm.formState.isSubmitting}
              >
                {magicForm.formState.isSubmitting ? 'Sending…' : 'Send magic link'}
              </Button>
            </form>
          )}
        </>
      )}

      <Separator className="my-6 bg-gray-100" />

      <p className="text-center text-sm text-slate-400">
        Don&apos;t have an account?{' '}
        <Link
          to="/auth/register"
          className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
        >
          Create account
        </Link>
      </p>
    </AuthLayout>
  )
}
