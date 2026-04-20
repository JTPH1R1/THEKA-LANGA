import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react'

import { AuthLayout } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  profileSetupSchema,
  TIMEZONE_OPTIONS,
  LOCALE_OPTIONS,
} from '@/lib/validators/profile.schema'
import { useUpdateProfile } from '@/hooks/useProfile'
import { useSession } from '@/hooks/useSession'
import type { ProfileSetupFormValues } from '@/lib/validators/profile.schema'

const STEPS = ['Your details', 'Preferences'] as const
type Step = 0 | 1

export function ProfileSetupPage() {
  const [step, setStep] = useState<Step>(0)
  const navigate = useNavigate()
  const { user } = useSession()
  const updateProfile = useUpdateProfile()

  const form = useForm<ProfileSetupFormValues>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      preferredName: '',
      phone: '',
      timezone: 'Africa/Nairobi',
      locale: 'en-KE',
    },
    mode: 'onBlur',
  })

  async function handleNext() {
    const step0Fields: (keyof ProfileSetupFormValues)[] = ['preferredName', 'phone']
    const valid = await form.trigger(step === 0 ? step0Fields : undefined)
    if (!valid) return
    setStep(1)
  }

  async function handleSubmit(values: ProfileSetupFormValues) {
    try {
      await updateProfile.mutateAsync({
        preferredName: values.preferredName,
        phone: values.phone || null,
        timezone: values.timezone,
        locale: values.locale,
      })
      toast.success('Profile set up! Welcome to Theka Langa.')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = (err as { message: string }).message
      form.setError('root', { message: msg })
    }
  }

  const fullLegalName = user?.user_metadata?.full_legal_name as string | undefined

  return (
    <AuthLayout
      title="Set up your profile"
      description="This takes about 1 minute. You can update everything later."
    >
      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-6">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center h-6 w-6 rounded-full text-xs font-medium transition-colors ${
                i < step
                  ? 'bg-teal-600 text-white'
                  : i === step
                  ? 'bg-teal-600 text-white ring-2 ring-teal-400 ring-offset-1 ring-offset-slate-900'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {i < step ? <CheckCircle2 size={14} /> : i + 1}
            </div>
            <span
              className={`text-xs ${i === step ? 'text-slate-300' : 'text-slate-500'}`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-6 ${i < step ? 'bg-teal-600' : 'bg-slate-700'}`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {form.formState.errors.root && (
          <Alert variant="destructive">
            <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
          </Alert>
        )}

        {/* Step 0 — Your details */}
        {step === 0 && (
          <>
            {fullLegalName && (
              <div className="bg-slate-800/60 rounded-lg px-4 py-3 text-sm">
                <span className="text-slate-400">Legal name: </span>
                <span className="text-slate-200 font-medium">{fullLegalName}</span>
                <p className="text-xs text-slate-500 mt-1">
                  This is how you appear on official documents. It cannot be changed here.
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="preferredName" className="text-slate-300">
                Display name
              </Label>
              <Input
                id="preferredName"
                placeholder="How you'd like to be called"
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-teal-500"
                {...form.register('preferredName')}
              />
              {form.formState.errors.preferredName && (
                <p className="text-xs text-red-400">
                  {form.formState.errors.preferredName.message}
                </p>
              )}
              <p className="text-xs text-slate-500">
                This is shown to other group members instead of your legal name.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-slate-300">
                Phone number <span className="text-slate-500">(optional)</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+254712345678"
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-teal-500"
                {...form.register('phone')}
              />
              {form.formState.errors.phone && (
                <p className="text-xs text-red-400">{form.formState.errors.phone.message}</p>
              )}
              <p className="text-xs text-slate-500">
                International format required. Needed for KYC Level 1.
              </p>
            </div>

            <Button
              type="button"
              onClick={handleNext}
              className="w-full bg-teal-600 hover:bg-teal-500 text-white gap-2"
            >
              Next <ChevronRight size={16} />
            </Button>
          </>
        )}

        {/* Step 1 — Preferences */}
        {step === 1 && (
          <>
            <div className="space-y-1.5">
              <Label className="text-slate-300">Timezone</Label>
              <Select
                defaultValue={form.getValues('timezone')}
                onValueChange={(v) => form.setValue('timezone', v)}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100 focus:ring-teal-500">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <SelectItem
                      key={tz.value}
                      value={tz.value}
                      className="text-slate-200 focus:bg-teal-900/40 focus:text-teal-300"
                    >
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.timezone && (
                <p className="text-xs text-red-400">{form.formState.errors.timezone.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300">Language / locale</Label>
              <Select
                defaultValue={form.getValues('locale')}
                onValueChange={(v) => form.setValue('locale', v)}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100 focus:ring-teal-500">
                  <SelectValue placeholder="Select locale" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {LOCALE_OPTIONS.map((loc) => (
                    <SelectItem
                      key={loc.value}
                      value={loc.value}
                      className="text-slate-200 focus:bg-teal-900/40 focus:text-teal-300"
                    >
                      {loc.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.locale && (
                <p className="text-xs text-red-400">{form.formState.errors.locale.message}</p>
              )}
              <p className="text-xs text-slate-500">
                Controls how dates, numbers, and currency are displayed.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(0)}
                className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800 gap-2"
              >
                <ChevronLeft size={16} /> Back
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-teal-600 hover:bg-teal-500 text-white"
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? 'Saving…' : 'Finish setup'}
              </Button>
            </div>
          </>
        )}
      </form>
    </AuthLayout>
  )
}
