import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { RulesForm } from '@/components/groups/rules-form/RulesForm'

import { groupInfoSchema, slugify, CURRENCY_OPTIONS, type GroupInfoValues } from '@/lib/validators/group.schema'
import { useCreateGroup } from '@/hooks/useGroups'
import type { FullRulesValues } from '@/lib/validators/group-rules.schema'

const TIMEZONE_OPTIONS = [
  { value: 'Africa/Nairobi',     label: 'East Africa Time (EAT)' },
  { value: 'Africa/Lagos',       label: 'West Africa Time (WAT)' },
  { value: 'Africa/Johannesburg',label: 'South Africa Time (SAST)' },
  { value: 'Africa/Cairo',       label: 'Eastern Europe Time / EAT' },
  { value: 'Europe/London',      label: 'GMT / London' },
  { value: 'America/New_York',   label: 'Eastern Time (ET)' },
  { value: 'Asia/Dubai',         label: 'Gulf Standard Time (GST)' },
]

export function GroupCreatePage() {
  const [step, setStep] = useState<'info' | 'rules'>('info')
  const [groupInfo, setGroupInfo] = useState<(GroupInfoValues & { slug: string }) | null>(null)
  const [rootError, setRootError] = useState<string | null>(null)

  const createGroup = useCreateGroup()

  const form = useForm<GroupInfoValues>({
    resolver: zodResolver(groupInfoSchema),
    defaultValues: {
      name: '',
      type: 'public',
      description: '',
      currency: 'KES',
      timezone: 'Africa/Nairobi',
    },
  })

  const watchedName = form.watch('name')
  const slug = slugify(watchedName)

  const { errors } = form.formState

  function handleInfoSubmit(values: GroupInfoValues) {
    setGroupInfo({ ...values, slug })
    setStep('rules')
  }

  async function handleRulesSubmit(rules: FullRulesValues) {
    if (!groupInfo) return
    setRootError(null)
    try {
      await createGroup.mutateAsync({ info: groupInfo, rules })
      toast.success('Group created!')
    } catch (err) {
      setRootError((err as { message: string }).message)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/groups"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-400 transition-colors mb-3"
        >
          <ArrowLeft size={13} /> Back to groups
        </Link>
        <h1 className="text-xl font-semibold text-slate-100">Create a group</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          {step === 'info' ? 'Step 1 of 2 — Group details' : 'Step 2 of 2 — Configure rules'}
        </p>
      </div>

      {/* Step 1 — Group info */}
      {step === 'info' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <form onSubmit={form.handleSubmit(handleInfoSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-slate-300">Group name <span className="text-red-400">*</span></Label>
              <Input
                id="name"
                placeholder="e.g. Nairobi Savings Circle"
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-teal-500"
                {...form.register('name')}
              />
              {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
              {watchedName && (
                <p className="text-xs text-slate-500">
                  URL slug: <span className="text-slate-400">/groups/{slug}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300">Group type <span className="text-red-400">*</span></Label>
              <Controller
                control={form.control}
                name="type"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100 focus:ring-teal-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="public"  className="text-slate-200 focus:bg-teal-900/40">
                        Public — visible in discovery
                      </SelectItem>
                      <SelectItem value="private" className="text-slate-200 focus:bg-teal-900/40">
                        Private — invite only
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && <p className="text-xs text-red-400">{errors.type.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-slate-300">
                Description <span className="text-slate-500">(optional)</span>
              </Label>
              <textarea
                id="description"
                rows={3}
                placeholder="What is this group about? Who can join?"
                className="w-full rounded-md bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 px-3 py-2 text-sm resize-none"
                {...form.register('description')}
              />
              {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-slate-300">Currency</Label>
                <Controller
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100 focus:ring-teal-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {CURRENCY_OPTIONS.map((c) => (
                          <SelectItem key={c.value} value={c.value} className="text-slate-200 focus:bg-teal-900/40">
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300">Timezone</Label>
                <Controller
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100 focus:ring-teal-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {TIMEZONE_OPTIONS.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value} className="text-slate-200 focus:bg-teal-900/40">
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cycleStart" className="text-slate-300">
                  Cycle start <span className="text-slate-500">(optional)</span>
                </Label>
                <Input
                  id="cycleStart"
                  type="date"
                  className="bg-slate-800 border-slate-700 text-slate-100 focus-visible:ring-teal-500"
                  {...form.register('cycleStart')}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cycleEnd" className="text-slate-300">
                  Cycle end <span className="text-slate-500">(optional)</span>
                </Label>
                <Input
                  id="cycleEnd"
                  type="date"
                  className="bg-slate-800 border-slate-700 text-slate-100 focus-visible:ring-teal-500"
                  {...form.register('cycleEnd')}
                />
                {errors.cycleEnd && <p className="text-xs text-red-400">{errors.cycleEnd.message}</p>}
              </div>
            </div>

            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-500 text-white">
              Continue to rules →
            </Button>
          </form>
        </div>
      )}

      {/* Step 2 — Rules */}
      {step === 'rules' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          {rootError && (
            <Alert variant="destructive" className="mb-5">
              <AlertDescription>{rootError}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-medium text-slate-200">{groupInfo?.name}</p>
              <p className="text-xs text-slate-500 capitalize">
                {groupInfo?.type} · {groupInfo?.currency}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStep('info')}
              className="text-xs text-slate-400 hover:text-teal-400 transition-colors"
            >
              ← Edit details
            </button>
          </div>

          <RulesForm
            onSubmit={handleRulesSubmit}
            isPending={createGroup.isPending}
            submitLabel="Create group"
          />
        </div>
      )}
    </div>
  )
}
