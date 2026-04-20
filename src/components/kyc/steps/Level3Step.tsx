import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { FileUploadField } from '@/components/kyc/FileUploadField'

import {
  level3Schema,
  EMPLOYMENT_STATUS_LABELS,
  INCOME_BAND_LABELS,
  SOURCE_OF_FUNDS_OPTIONS,
  AFRICAN_COUNTRIES,
} from '@/lib/validators/kyc.schema'
import { useSubmitLevel3 } from '@/hooks/useKyc'
import type { Level3FormValues } from '@/lib/validators/kyc.schema'

const PROOF_DOC_LABELS: Record<string, string> = {
  utility_bill: 'Utility bill',
  bank_statement: 'Bank statement',
  lease_agreement: 'Lease / tenancy agreement',
  official_letter: 'Official government letter',
  rates_receipt: 'Rates / land rates receipt',
}

export function Level3Step() {
  const submit = useSubmitLevel3()

  const form = useForm<Level3FormValues>({
    resolver: zodResolver(level3Schema),
    defaultValues: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      countyProvince: '',
      postalCode: '',
      country: 'KE',
      proofDocType: undefined,
      proofPeriod: '',
      proofImage: undefined,
      employmentStatus: undefined,
      monthlyIncomeBand: undefined,
      sourceOfFunds: [],
      taxIdNumber: '',
      isPep: false,
      usPerson: false,
      declarationAccepted: undefined,
    },
  })

  async function handleSubmit(values: Level3FormValues) {
    try {
      await submit.mutateAsync(values)
      toast.success('Documents submitted for review!')
    } catch (err) {
      form.setError('root', { message: (err as { message: string }).message })
    }
  }

  const { errors } = form.formState
  const sourceOfFunds = form.watch('sourceOfFunds')

  function toggleSource(value: string) {
    const current = form.getValues('sourceOfFunds')
    if (current.includes(value)) {
      form.setValue('sourceOfFunds', current.filter((v) => v !== value), { shouldValidate: true })
    } else {
      form.setValue('sourceOfFunds', [...current, value], { shouldValidate: true })
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {errors.root && (
        <Alert variant="destructive">
          <AlertDescription>{errors.root.message}</AlertDescription>
        </Alert>
      )}

      {/* Address */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-slate-300 border-b border-slate-800 pb-2">
          Residential address
        </h3>

        <div className="space-y-1.5">
          <Label htmlFor="addressLine1" className="text-slate-300">Street address</Label>
          <Input
            id="addressLine1"
            placeholder="House number and street name"
            className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-teal-500"
            {...form.register('addressLine1')}
          />
          {errors.addressLine1 && (
            <p className="text-xs text-red-400">{errors.addressLine1.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="addressLine2" className="text-slate-300">
            Estate / apartment <span className="text-slate-500">(optional)</span>
          </Label>
          <Input
            id="addressLine2"
            placeholder="Estate, block, apartment number"
            className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-teal-500"
            {...form.register('addressLine2')}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="city" className="text-slate-300">City / town</Label>
            <Input
              id="city"
              placeholder="e.g. Nairobi"
              className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-teal-500"
              {...form.register('city')}
            />
            {errors.city && <p className="text-xs text-red-400">{errors.city.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="countyProvince" className="text-slate-300">
              County / province <span className="text-slate-500">(optional)</span>
            </Label>
            <Input
              id="countyProvince"
              placeholder="e.g. Nairobi County"
              className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-teal-500"
              {...form.register('countyProvince')}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="postalCode" className="text-slate-300">
              Postal code <span className="text-slate-500">(optional)</span>
            </Label>
            <Input
              id="postalCode"
              placeholder="e.g. 00100"
              className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-teal-500"
              {...form.register('postalCode')}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300">Country</Label>
            <Controller
              control={form.control}
              name="country"
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100 focus:ring-teal-500">
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
                    {AFRICAN_COUNTRIES.map((c) => (
                      <SelectItem key={c.value} value={c.value} className="text-slate-200 focus:bg-teal-900/40">
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.country && <p className="text-xs text-red-400">{errors.country.message}</p>}
          </div>
        </div>

        {/* Address proof */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-slate-300">Proof document type</Label>
            <Controller
              control={form.control}
              name="proofDocType"
              render={({ field }) => (
                <Select onValueChange={field.onChange}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100 focus:ring-teal-500">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {Object.entries(PROOF_DOC_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v} className="text-slate-200 focus:bg-teal-900/40">
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.proofDocType && (
              <p className="text-xs text-red-400">{errors.proofDocType.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="proofPeriod" className="text-slate-300">Document period</Label>
            <Input
              id="proofPeriod"
              placeholder="e.g. March 2026"
              className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-teal-500"
              {...form.register('proofPeriod')}
            />
            {errors.proofPeriod && (
              <p className="text-xs text-red-400">{errors.proofPeriod.message}</p>
            )}
          </div>
        </div>

        <Controller
          control={form.control}
          name="proofImage"
          render={({ field }) => (
            <FileUploadField
              label="Proof of address document"
              required
              hint="Must clearly show your name and address. Must be dated within 3 months."
              onChange={(f) => field.onChange(f)}
              error={errors.proofImage?.message as string | undefined}
            />
          )}
        />
      </div>

      {/* Financial declaration */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-slate-300 border-b border-slate-800 pb-2">
          Financial declaration
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-slate-300">Employment status</Label>
            <Controller
              control={form.control}
              name="employmentStatus"
              render={({ field }) => (
                <Select onValueChange={field.onChange}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100 focus:ring-teal-500">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {Object.entries(EMPLOYMENT_STATUS_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v} className="text-slate-200 focus:bg-teal-900/40">
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.employmentStatus && (
              <p className="text-xs text-red-400">{errors.employmentStatus.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300">Monthly income band</Label>
            <Controller
              control={form.control}
              name="monthlyIncomeBand"
              render={({ field }) => (
                <Select onValueChange={field.onChange}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100 focus:ring-teal-500">
                    <SelectValue placeholder="Select band" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {Object.entries(INCOME_BAND_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v} className="text-slate-200 focus:bg-teal-900/40">
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.monthlyIncomeBand && (
              <p className="text-xs text-red-400">{errors.monthlyIncomeBand.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-300">Source of funds <span className="text-red-400">*</span></Label>
          <div className="grid grid-cols-2 gap-2">
            {SOURCE_OF_FUNDS_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 cursor-pointer text-sm text-slate-300"
              >
                <Checkbox
                  checked={sourceOfFunds?.includes(opt.value)}
                  onCheckedChange={() => toggleSource(opt.value)}
                  className="border-slate-600 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                />
                {opt.label}
              </label>
            ))}
          </div>
          {errors.sourceOfFunds && (
            <p className="text-xs text-red-400">{errors.sourceOfFunds.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="taxIdNumber" className="text-slate-300">
            KRA PIN / Tax ID <span className="text-slate-500">(optional)</span>
          </Label>
          <Input
            id="taxIdNumber"
            placeholder="e.g. A000000000Z"
            className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-teal-500"
            {...form.register('taxIdNumber')}
          />
        </div>
      </div>

      {/* Legal declarations */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-slate-300 border-b border-slate-800 pb-2">
          Legal declarations
        </h3>

        <Controller
          control={form.control}
          name="isPep"
          render={({ field }) => (
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                className="mt-0.5 border-slate-600 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
              />
              <span className="text-sm text-slate-300">
                I am a <strong>Politically Exposed Person</strong> (PEP) — a current or former
                senior public official, or close associate of one.
              </span>
            </label>
          )}
        />

        <Controller
          control={form.control}
          name="usPerson"
          render={({ field }) => (
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                className="mt-0.5 border-slate-600 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
              />
              <span className="text-sm text-slate-300">
                I am a <strong>US Person</strong> for FATCA purposes (US citizen, green card
                holder, or US tax resident).
              </span>
            </label>
          )}
        />

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
          <p className="text-xs text-slate-400 leading-relaxed">
            I declare that all information provided is true and accurate to the best of my
            knowledge. I understand that providing false information may result in termination of
            my account and may be subject to legal action. I consent to my information being
            used for identity verification and anti-money laundering checks.
          </p>
          <Controller
            control={form.control}
            name="declarationAccepted"
            render={({ field }) => (
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={field.value === true}
                  onCheckedChange={(v) => field.onChange(v === true ? true : undefined)}
                  className="border-slate-600 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                />
                <span className="text-sm text-slate-200 font-medium">
                  I accept the above declaration <span className="text-red-400">*</span>
                </span>
              </label>
            )}
          />
          {errors.declarationAccepted && (
            <p className="text-xs text-red-400">{errors.declarationAccepted.message}</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-teal-600 hover:bg-teal-500 text-white"
        disabled={submit.isPending}
      >
        {submit.isPending ? 'Submitting…' : 'Submit for enhanced verification'}
      </Button>

      <p className="text-xs text-slate-500 text-center">
        Enhanced verification is reviewed within 2–5 business days. You will be notified when approved.
      </p>
    </form>
  )
}
