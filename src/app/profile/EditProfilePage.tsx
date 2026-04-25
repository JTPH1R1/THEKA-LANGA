import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AvatarUpload } from '@/components/profile/AvatarUpload'

import {
  profileEditSchema,
  TIMEZONE_OPTIONS,
  LOCALE_OPTIONS,
} from '@/lib/validators/profile.schema'
import { useMyProfile, useUpdateProfile } from '@/hooks/useProfile'
import { KYC_LEVEL_LABELS } from '@/lib/constants'
import type { ProfileEditFormValues } from '@/lib/validators/profile.schema'

export function EditProfilePage() {
  const navigate = useNavigate()
  const { data: profile, isLoading } = useMyProfile()
  const updateProfile = useUpdateProfile()

  const form = useForm<ProfileEditFormValues>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      preferredName: '',
      phone: '',
      timezone: 'Africa/Nairobi',
      locale: 'en-KE',
    },
  })

  useEffect(() => {
    if (profile) {
      form.reset({
        preferredName: profile.preferredName ?? '',
        phone: profile.phone ?? '',
        timezone: profile.timezone,
        locale: profile.locale,
      })
    }
  }, [profile, form])

  async function handleSubmit(values: ProfileEditFormValues) {
    try {
      await updateProfile.mutateAsync({
        preferredName: values.preferredName,
        phone: values.phone || null,
        timezone: values.timezone,
        locale: values.locale,
      })
      toast.success('Profile updated')
    } catch (err) {
      const msg = (err as { message: string }).message
      form.setError('root', { message: msg })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 p-4 sm:p-8">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-slate-800 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold">Edit profile</h1>
        </div>

        {/* Avatar */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
          <AvatarUpload
            currentUrl={profile.avatarUrl}
            displayName={profile.preferredName ?? profile.fullLegalName}
          />
        </div>

        {/* Read-only info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4 space-y-3">
          <div>
            <p className="text-xs text-slate-400 mb-1">Legal name</p>
            <p className="text-sm text-slate-800">{profile.fullLegalName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Email</p>
            <p className="text-sm text-slate-800">{profile.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <p className="text-xs text-slate-400 mb-1">KYC level</p>
              <Badge
                variant="outline"
                className="border-teal-300 text-teal-600 text-xs"
              >
                {KYC_LEVEL_LABELS[profile.kycLevel]}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Credit score</p>
              <Badge
                variant="outline"
                className="border-gray-300 text-slate-700 text-xs"
              >
                {profile.creditScore} · {profile.creditScoreBand}
              </Badge>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Legal name, email, KYC level, and credit score cannot be changed here.
          </p>
        </div>

        {/* Editable form */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-medium text-slate-700 mb-4">Personal details</h2>

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {form.formState.errors.root && (
              <Alert variant="destructive">
                <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="preferredName" className="text-slate-700">Display name</Label>
              <Input
                id="preferredName"
                placeholder="How you'd like to be called"
                className="bg-gray-100 border-gray-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500"
                {...form.register('preferredName')}
              />
              {form.formState.errors.preferredName && (
                <p className="text-xs text-red-400">
                  {form.formState.errors.preferredName.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-slate-700">
                Phone number{' '}
                {profile.phoneVerified && (
                  <span className="text-teal-600 text-xs">✓ verified</span>
                )}
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+254712345678"
                className="bg-gray-100 border-gray-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500"
                {...form.register('phone')}
              />
              {form.formState.errors.phone && (
                <p className="text-xs text-red-400">{form.formState.errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-700">Timezone</Label>
              <Select
                value={form.watch('timezone')}
                onValueChange={(v) => form.setValue('timezone', v, { shouldDirty: true })}
              >
                <SelectTrigger className="bg-gray-100 border-gray-300 text-slate-900 focus:ring-teal-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-100 border-gray-300">
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <SelectItem
                      key={tz.value}
                      value={tz.value}
                      className="text-slate-800 focus:bg-teal-50 focus:text-teal-700"
                    >
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-700">Language / locale</Label>
              <Select
                value={form.watch('locale')}
                onValueChange={(v) => form.setValue('locale', v, { shouldDirty: true })}
              >
                <SelectTrigger className="bg-gray-100 border-gray-300 text-slate-900 focus:ring-teal-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-100 border-gray-300">
                  {LOCALE_OPTIONS.map((loc) => (
                    <SelectItem
                      key={loc.value}
                      value={loc.value}
                      className="text-slate-800 focus:bg-teal-50 focus:text-teal-700"
                    >
                      {loc.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-500 text-white"
              disabled={updateProfile.isPending || !form.formState.isDirty}
            >
              {updateProfile.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
