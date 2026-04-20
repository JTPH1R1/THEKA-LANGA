import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

import { fullRulesSchema, type FullRulesValues } from '@/lib/validators/group-rules.schema'

const STEPS = [
  'Contributions',
  'Membership',
  'Loans',
  'Defaults',
  'Returns',
] as const

// Field groups per step — used to trigger partial validation
const STEP_FIELDS: (keyof FullRulesValues)[][] = [
  ['contributionAmount', 'contributionFrequency', 'gracePeriodDays', 'lateFineFlat', 'lateFineInterestRateDaily'],
  ['initiationFee', 'lateJoiningFee', 'midJoinAllowed', 'midJoinDeadlineWeeks', 'minKycLevel'],
  ['loanEnabled', 'maxLoanMultiplier', 'loanInterestRate', 'loanInterestType', 'loanRepaymentPeriods', 'loanProcessingFeeRate', 'maxActiveLoansPerMember', 'guarantorRequired', 'guarantorsRequiredCount'],
  ['defaultThresholdDays', 'defaultPenaltyRate', 'blacklistRecommendationAfter'],
  ['dividendDistribution'],
]

interface RulesFormProps {
  defaultValues?: Partial<FullRulesValues>
  onSubmit: (values: FullRulesValues) => void
  isPending?: boolean
  submitLabel?: string
}

function FieldRow({ label, hint, error, children }: {
  label: string; hint?: string; error?: string; children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-slate-300">{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

const inputCls = 'bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-teal-500'
const selectCls = 'bg-slate-800 border-slate-700 text-slate-100 focus:ring-teal-500'
const selectContentCls = 'bg-slate-800 border-slate-700'
const selectItemCls = 'text-slate-200 focus:bg-teal-900/40'

export function RulesForm({ defaultValues, onSubmit, isPending, submitLabel = 'Save rules' }: RulesFormProps) {
  const [step, setStep] = useState(0)

  const form = useForm<FullRulesValues>({
    resolver: zodResolver(fullRulesSchema),
    defaultValues: {
      contributionAmount: 0,
      contributionFrequency: 'monthly',
      gracePeriodDays: 3,
      lateFineFlat: 0,
      lateFineInterestRateDaily: 0,
      initiationFee: 0,
      lateJoiningFee: 0,
      midJoinAllowed: true,
      midJoinDeadlineWeeks: 4,
      minKycLevel: 1,
      loanEnabled: true,
      maxLoanMultiplier: 3,
      loanInterestRate: 10,
      loanInterestType: 'flat',
      loanRepaymentPeriods: 3,
      loanProcessingFeeRate: 2,
      maxActiveLoansPerMember: 1,
      guarantorRequired: true,
      guarantorsRequiredCount: 2,
      defaultThresholdDays: 30,
      defaultPenaltyRate: 5,
      blacklistRecommendationAfter: 3,
      dividendDistribution: 'proportional',
      ...defaultValues,
    },
  })

  const { errors } = form.formState
  const { watch } = form
  const loanEnabled = watch('loanEnabled')
  const guarantorRequired = watch('guarantorRequired')
  const midJoinAllowed = watch('midJoinAllowed')

  async function handleNext() {
    const valid = await form.trigger(STEP_FIELDS[step])
    if (valid) setStep((s) => s + 1)
  }

  return (
    <div>
      {/* Step tabs */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => i < step && setStep(i)}
            className={[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0',
              i === step
                ? 'bg-teal-900/40 text-teal-300 border border-teal-800'
                : i < step
                  ? 'text-teal-400 hover:bg-slate-800 cursor-pointer'
                  : 'text-slate-600 cursor-default',
            ].join(' ')}
          >
            <span className={[
              'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
              i < step ? 'bg-teal-600 text-white' : i === step ? 'bg-teal-900 text-teal-300 border border-teal-700' : 'bg-slate-800 text-slate-600',
            ].join(' ')}>{i + 1}</span>
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

        {/* Step 0 — Contributions */}
        {step === 0 && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <FieldRow label="Contribution amount" error={errors.contributionAmount?.message}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">KES</span>
                  <Input
                    type="number" min={0} step={0.01}
                    className={`${inputCls} pl-12`}
                    placeholder="500"
                    {...form.register('contributionAmount', { valueAsNumber: true })}
                  />
                </div>
              </FieldRow>
              <FieldRow label="Frequency" error={errors.contributionFrequency?.message}>
                <Controller
                  control={form.control} name="contributionFrequency"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className={selectCls}><SelectValue /></SelectTrigger>
                      <SelectContent className={selectContentCls}>
                        <SelectItem value="weekly"   className={selectItemCls}>Weekly</SelectItem>
                        <SelectItem value="biweekly" className={selectItemCls}>Biweekly</SelectItem>
                        <SelectItem value="monthly"  className={selectItemCls}>Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FieldRow>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FieldRow label="Grace period (days)" error={errors.gracePeriodDays?.message}>
                <Input type="number" min={0} max={30} className={inputCls}
                  {...form.register('gracePeriodDays', { valueAsNumber: true })} />
              </FieldRow>
              <FieldRow label="Late fine — flat (KES)" hint="0 = no flat fine" error={errors.lateFineFlat?.message}>
                <Input type="number" min={0} step={0.01} className={inputCls}
                  {...form.register('lateFineFlat', { valueAsNumber: true })} />
              </FieldRow>
            </div>
            <FieldRow label="Late fine — daily interest %" hint="0 = no daily interest" error={errors.lateFineInterestRateDaily?.message}>
              <Input type="number" min={0} max={100} step={0.01} className={inputCls}
                {...form.register('lateFineInterestRateDaily', { valueAsNumber: true })} />
            </FieldRow>
          </>
        )}

        {/* Step 1 — Membership */}
        {step === 1 && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <FieldRow label="Initiation fee (KES)" hint="Paid once when joining" error={errors.initiationFee?.message}>
                <Input type="number" min={0} step={0.01} className={inputCls}
                  {...form.register('initiationFee', { valueAsNumber: true })} />
              </FieldRow>
              <FieldRow label="Maximum members" hint="Leave empty = unlimited" error={errors.maxMembers?.message}>
                <Input type="number" min={2} max={500} placeholder="Unlimited" className={inputCls}
                  {...form.register('maxMembers', { valueAsNumber: true, setValueAs: v => v === '' || isNaN(Number(v)) ? undefined : Number(v) })} />
              </FieldRow>
            </div>
            <FieldRow label="Minimum KYC level to join" error={errors.minKycLevel?.message}>
              <Controller
                control={form.control} name="minKycLevel"
                render={({ field }) => (
                  <Select onValueChange={(v) => field.onChange(Number(v))} defaultValue={String(field.value)}>
                    <SelectTrigger className={selectCls}><SelectValue /></SelectTrigger>
                    <SelectContent className={selectContentCls}>
                      <SelectItem value="0" className={selectItemCls}>0 — None (not recommended)</SelectItem>
                      <SelectItem value="1" className={selectItemCls}>1 — Basic (phone verified)</SelectItem>
                      <SelectItem value="2" className={selectItemCls}>2 — Standard (ID approved)</SelectItem>
                      <SelectItem value="3" className={selectItemCls}>3 — Enhanced (address verified)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FieldRow>
            <Separator className="bg-slate-800" />
            <Controller
              control={form.control} name="midJoinAllowed"
              render={({ field }) => (
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox checked={field.value} onCheckedChange={field.onChange}
                    className="border-slate-600 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600" />
                  <span className="text-sm text-slate-300">Allow mid-cycle joining</span>
                </label>
              )}
            />
            {midJoinAllowed && (
              <div className="grid grid-cols-2 gap-4 pl-7">
                <FieldRow label="Late joining fee (KES)" error={errors.lateJoiningFee?.message}>
                  <Input type="number" min={0} step={0.01} className={inputCls}
                    {...form.register('lateJoiningFee', { valueAsNumber: true })} />
                </FieldRow>
                <FieldRow label="Max weeks to join after start" error={errors.midJoinDeadlineWeeks?.message}>
                  <Input type="number" min={1} max={52} className={inputCls}
                    {...form.register('midJoinDeadlineWeeks', { valueAsNumber: true })} />
                </FieldRow>
              </div>
            )}
          </>
        )}

        {/* Step 2 — Loans */}
        {step === 2 && (
          <>
            <Controller
              control={form.control} name="loanEnabled"
              render={({ field }) => (
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox checked={field.value} onCheckedChange={field.onChange}
                    className="border-slate-600 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600" />
                  <span className="text-sm text-slate-300">Enable loans for this group</span>
                </label>
              )}
            />
            {loanEnabled && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FieldRow label="Max loan multiplier" hint="× total contributions" error={errors.maxLoanMultiplier?.message}>
                    <Input type="number" min={0.5} max={20} step={0.5} className={inputCls}
                      {...form.register('maxLoanMultiplier', { valueAsNumber: true })} />
                  </FieldRow>
                  <FieldRow label="Annual interest rate %" error={errors.loanInterestRate?.message}>
                    <Input type="number" min={0} max={100} step={0.1} className={inputCls}
                      {...form.register('loanInterestRate', { valueAsNumber: true })} />
                  </FieldRow>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FieldRow label="Interest type" error={errors.loanInterestType?.message}>
                    <Controller
                      control={form.control} name="loanInterestType"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className={selectCls}><SelectValue /></SelectTrigger>
                          <SelectContent className={selectContentCls}>
                            <SelectItem value="flat"              className={selectItemCls}>Flat rate</SelectItem>
                            <SelectItem value="reducing_balance"  className={selectItemCls}>Reducing balance</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FieldRow>
                  <FieldRow label="Repayment periods (months)" error={errors.loanRepaymentPeriods?.message}>
                    <Input type="number" min={1} max={60} className={inputCls}
                      {...form.register('loanRepaymentPeriods', { valueAsNumber: true })} />
                  </FieldRow>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FieldRow label="Processing fee %" error={errors.loanProcessingFeeRate?.message}>
                    <Input type="number" min={0} max={10} step={0.1} className={inputCls}
                      {...form.register('loanProcessingFeeRate', { valueAsNumber: true })} />
                  </FieldRow>
                  <FieldRow label="Max active loans per member" error={errors.maxActiveLoansPerMember?.message}>
                    <Input type="number" min={1} max={5} className={inputCls}
                      {...form.register('maxActiveLoansPerMember', { valueAsNumber: true })} />
                  </FieldRow>
                </div>
                <Separator className="bg-slate-800" />
                <Controller
                  control={form.control} name="guarantorRequired"
                  render={({ field }) => (
                    <label className="flex items-center gap-3 cursor-pointer">
                      <Checkbox checked={field.value} onCheckedChange={field.onChange}
                        className="border-slate-600 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600" />
                      <span className="text-sm text-slate-300">Require guarantors</span>
                    </label>
                  )}
                />
                {guarantorRequired && (
                  <div className="grid grid-cols-2 gap-4 pl-7">
                    <FieldRow label="Number of guarantors" error={errors.guarantorsRequiredCount?.message}>
                      <Input type="number" min={1} max={5} className={inputCls}
                        {...form.register('guarantorsRequiredCount', { valueAsNumber: true })} />
                    </FieldRow>
                    <FieldRow label="Min guarantor credit score" hint="Optional" error={errors.minGuarantorCreditScore?.message}>
                      <Input type="number" min={300} max={850} placeholder="500" className={inputCls}
                        {...form.register('minGuarantorCreditScore', { valueAsNumber: true, setValueAs: v => v === '' || isNaN(Number(v)) ? undefined : Number(v) })} />
                    </FieldRow>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Step 3 — Defaults */}
        {step === 3 && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <FieldRow label="Days overdue = default" error={errors.defaultThresholdDays?.message}>
                <Input type="number" min={7} max={90} className={inputCls}
                  {...form.register('defaultThresholdDays', { valueAsNumber: true })} />
              </FieldRow>
              <FieldRow label="Default penalty %" error={errors.defaultPenaltyRate?.message}>
                <Input type="number" min={0} max={50} step={0.1} className={inputCls}
                  {...form.register('defaultPenaltyRate', { valueAsNumber: true })} />
              </FieldRow>
            </div>
            <FieldRow
              label="Consecutive defaults before blacklist recommendation"
              hint="System will flag the member for admin review after this many consecutive defaults"
              error={errors.blacklistRecommendationAfter?.message}
            >
              <Input type="number" min={1} max={10} className={inputCls}
                {...form.register('blacklistRecommendationAfter', { valueAsNumber: true })} />
            </FieldRow>
          </>
        )}

        {/* Step 4 — Returns */}
        {step === 4 && (
          <FieldRow label="Dividend distribution" hint="How end-of-cycle returns are split among members" error={errors.dividendDistribution?.message}>
            <Controller
              control={form.control} name="dividendDistribution"
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className={selectCls}><SelectValue /></SelectTrigger>
                  <SelectContent className={selectContentCls}>
                    <SelectItem value="proportional" className={selectItemCls}>Proportional — based on total contributions</SelectItem>
                    <SelectItem value="equal"        className={selectItemCls}>Equal — same share per active member</SelectItem>
                    <SelectItem value="none"         className={selectItemCls}>None — reinvest / no distribution</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </FieldRow>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button" variant="ghost"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="text-slate-400 hover:text-slate-200 gap-1.5"
          >
            <ChevronLeft size={15} /> Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="bg-teal-600 hover:bg-teal-500 text-white gap-1.5"
            >
              Next <ChevronRight size={15} />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isPending}
              className="bg-teal-600 hover:bg-teal-500 text-white"
            >
              {isPending ? 'Saving…' : submitLabel}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
