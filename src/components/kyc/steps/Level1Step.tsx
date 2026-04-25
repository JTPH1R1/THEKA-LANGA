import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

import { level1Schema, AFRICAN_COUNTRIES } from '@/lib/validators/kyc.schema'
import { useCompleteLevel1 } from '@/hooks/useKyc'
import type { Level1FormValues } from '@/lib/validators/kyc.schema'

interface Level1StepProps {
  email: string
  phone: string | null
}

export function Level1Step({ email, phone }: Level1StepProps) {
  const complete = useCompleteLevel1()

  const form = useForm<Level1FormValues>({
    resolver: zodResolver(level1Schema),
    defaultValues: { dateOfBirth: '', gender: undefined, nationality: '' },
  })

  async function handleSubmit(values: Level1FormValues) {
    if (!phone) {
      toast.error('Add your phone number in profile settings before completing Level 1.')
      return
    }
    try {
      await complete.mutateAsync({
        dateOfBirth: values.dateOfBirth,
        gender: values.gender,
        nationality: values.nationality,
      })
      toast.success('Level 1 verification complete!')
    } catch (err) {
      form.setError('root', { message: (err as { message: string }).message })
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      {form.formState.errors.root && (
        <Alert variant="destructive">
          <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
        </Alert>
      )}

      {/* Read-only checks */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 size={16} className="text-teal-600" />
          <span className="text-slate-700">Email verified:</span>
          <span className="text-slate-800 font-medium">{email}</span>
        </div>
        <div className={`flex items-center gap-2 text-sm ${phone ? '' : 'opacity-60'}`}>
          {phone
            ? <CheckCircle2 size={16} className="text-teal-600" />
            : <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
          }
          <span className="text-slate-700">Phone number:</span>
          {phone
            ? <span className="text-slate-800 font-medium">{phone}</span>
            : <span className="text-amber-600 text-xs">Not set — add in profile settings</span>
          }
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-4">
        <p className="text-xs text-slate-400">
          Complete the fields below to verify your identity.
        </p>

        <div className="space-y-1.5">
          <Label htmlFor="dob" className="text-slate-700">Date of birth</Label>
          <Input
            id="dob"
            type="date"
            className="bg-gray-100 border-gray-300 text-slate-900 focus-visible:ring-teal-500"
            {...form.register('dateOfBirth')}
          />
          {form.formState.errors.dateOfBirth && (
            <p className="text-xs text-red-400">{form.formState.errors.dateOfBirth.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-slate-700">Gender</Label>
          <Select onValueChange={(v) => form.setValue('gender', v as Level1FormValues['gender'])}>
            <SelectTrigger className="bg-gray-100 border-gray-300 text-slate-900 focus:ring-teal-500">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent className="bg-gray-100 border-gray-300">
              {[
                { value: 'male',              label: 'Male' },
                { value: 'female',            label: 'Female' },
                { value: 'other',             label: 'Other' },
                { value: 'prefer_not_to_say', label: 'Prefer not to say' },
              ].map((o) => (
                <SelectItem
                  key={o.value}
                  value={o.value}
                  className="text-slate-800 focus:bg-teal-50"
                >
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.gender && (
            <p className="text-xs text-red-400">{form.formState.errors.gender.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-slate-700">Nationality</Label>
          <Select onValueChange={(v) => form.setValue('nationality', v)}>
            <SelectTrigger className="bg-gray-100 border-gray-300 text-slate-900 focus:ring-teal-500">
              <SelectValue placeholder="Select nationality" />
            </SelectTrigger>
            <SelectContent className="bg-gray-100 border-gray-300 max-h-60">
              {AFRICAN_COUNTRIES.map((c) => (
                <SelectItem
                  key={c.value}
                  value={c.value}
                  className="text-slate-800 focus:bg-teal-50"
                >
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.nationality && (
            <p className="text-xs text-red-400">{form.formState.errors.nationality.message}</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-teal-600 hover:bg-teal-500 text-white"
        disabled={complete.isPending || !phone}
      >
        {complete.isPending ? 'Verifying…' : 'Complete Level 1'}
      </Button>
    </form>
  )
}
