import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { FileUploadField } from '@/components/kyc/FileUploadField'

import {
  level2Schema,
  DOC_TYPE_LABELS,
  AFRICAN_COUNTRIES,
} from '@/lib/validators/kyc.schema'
import { useSubmitLevel2 } from '@/hooks/useKyc'
import type { Level2FormValues } from '@/lib/validators/kyc.schema'

export function Level2Step() {
  const submit = useSubmitLevel2()

  const form = useForm<Level2FormValues>({
    resolver: zodResolver(level2Schema),
    defaultValues: {
      docType: undefined,
      docNumber: '',
      issuingCountry: '',
      docFullName: '',
      expiryDate: '',
      nokFullName: '',
      nokRelationship: undefined,
      nokPhone: '',
    },
  })

  async function handleSubmit(values: Level2FormValues) {
    try {
      await submit.mutateAsync({
        docType: values.docType,
        docNumber: values.docNumber,
        issuingCountry: values.issuingCountry,
        docFullName: values.docFullName,
        expiryDate: values.expiryDate || undefined,
        frontImage: values.frontImage,
        backImage: values.backImage,
        selfieImage: values.selfieImage,
        nokFullName: values.nokFullName,
        nokRelationship: values.nokRelationship,
        nokPhone: values.nokPhone,
      })
      toast.success('Documents submitted for review!')
    } catch (err) {
      form.setError('root', { message: (err as { message: string }).message })
    }
  }

  const { errors } = form.formState

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {errors.root && (
        <Alert variant="destructive">
          <AlertDescription>{errors.root.message}</AlertDescription>
        </Alert>
      )}

      {/* ID Document */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-slate-700 border-b border-gray-200 pb-2">
          Government ID
        </h3>

        <div className="space-y-1.5">
          <Label className="text-slate-700">Document type</Label>
          <Controller
            control={form.control}
            name="docType"
            render={({ field }) => (
              <Select onValueChange={field.onChange}>
                <SelectTrigger className="bg-gray-100 border-gray-300 text-slate-900 focus:ring-teal-500">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-100 border-gray-300">
                  {Object.entries(DOC_TYPE_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v} className="text-slate-800 focus:bg-teal-50">
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.docType && <p className="text-xs text-red-400">{errors.docType.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="docNumber" className="text-slate-700">Document number</Label>
            <Input
              id="docNumber"
              placeholder="e.g. 12345678"
              className="bg-gray-100 border-gray-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500"
              {...form.register('docNumber')}
            />
            {errors.docNumber && (
              <p className="text-xs text-red-400">{errors.docNumber.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-700">Issuing country</Label>
            <Controller
              control={form.control}
              name="issuingCountry"
              render={({ field }) => (
                <Select onValueChange={field.onChange}>
                  <SelectTrigger className="bg-gray-100 border-gray-300 text-slate-900 focus:ring-teal-500">
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-100 border-gray-300 max-h-60">
                    {AFRICAN_COUNTRIES.map((c) => (
                      <SelectItem key={c.value} value={c.value} className="text-slate-800 focus:bg-teal-50">
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.issuingCountry && (
              <p className="text-xs text-red-400">{errors.issuingCountry.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="docFullName" className="text-slate-700">Name on document</Label>
            <Input
              id="docFullName"
              placeholder="Exactly as printed"
              className="bg-gray-100 border-gray-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500"
              {...form.register('docFullName')}
            />
            {errors.docFullName && (
              <p className="text-xs text-red-400">{errors.docFullName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="expiryDate" className="text-slate-700">
              Expiry date <span className="text-slate-400">(if applicable)</span>
            </Label>
            <Input
              id="expiryDate"
              type="date"
              className="bg-gray-100 border-gray-300 text-slate-900 focus-visible:ring-teal-500"
              {...form.register('expiryDate')}
            />
          </div>
        </div>

        <Controller
          control={form.control}
          name="frontImage"
          render={({ field }) => (
            <FileUploadField
              label="Front of document"
              required
              hint="Clear photo of the front side — must show your photo and name"
              onChange={(f) => field.onChange(f)}
              error={errors.frontImage?.message as string | undefined}
            />
          )}
        />

        <Controller
          control={form.control}
          name="backImage"
          render={({ field }) => (
            <FileUploadField
              label="Back of document (optional)"
              hint="Required for National ID and Driver's License"
              onChange={(f) => field.onChange(f)}
              error={errors.backImage?.message as string | undefined}
            />
          )}
        />
      </div>

      {/* Selfie */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-slate-700 border-b border-gray-200 pb-2">
          Selfie / Liveness photo
        </h3>
        <Controller
          control={form.control}
          name="selfieImage"
          render={({ field }) => (
            <FileUploadField
              label="Clear selfie photo"
              required
              accept="image/jpeg,image/png,image/webp"
              hint="Hold your ID next to your face. Good lighting. No sunglasses."
              onChange={(f) => field.onChange(f)}
              error={errors.selfieImage?.message as string | undefined}
            />
          )}
        />
      </div>

      {/* Next of Kin */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-slate-700 border-b border-gray-200 pb-2">
          Next of kin / emergency contact
        </h3>

        <div className="space-y-1.5">
          <Label htmlFor="nokFullName" className="text-slate-700">Full name</Label>
          <Input
            id="nokFullName"
            placeholder="Next of kin full name"
            className="bg-gray-100 border-gray-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500"
            {...form.register('nokFullName')}
          />
          {errors.nokFullName && (
            <p className="text-xs text-red-400">{errors.nokFullName.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-slate-700">Relationship</Label>
            <Controller
              control={form.control}
              name="nokRelationship"
              render={({ field }) => (
                <Select onValueChange={field.onChange}>
                  <SelectTrigger className="bg-gray-100 border-gray-300 text-slate-900 focus:ring-teal-500">
                    <SelectValue placeholder="Relationship" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-100 border-gray-300">
                    {[
                      'spouse','parent','sibling','child','friend','colleague','guardian','other',
                    ].map((r) => (
                      <SelectItem
                        key={r}
                        value={r}
                        className="text-slate-800 focus:bg-teal-50 capitalize"
                      >
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.nokRelationship && (
              <p className="text-xs text-red-400">{errors.nokRelationship.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nokPhone" className="text-slate-700">Phone number</Label>
            <Input
              id="nokPhone"
              type="tel"
              placeholder="+254712345678"
              className="bg-gray-100 border-gray-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500"
              {...form.register('nokPhone')}
            />
            {errors.nokPhone && (
              <p className="text-xs text-red-400">{errors.nokPhone.message}</p>
            )}
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-teal-600 hover:bg-teal-500 text-white"
        disabled={submit.isPending}
      >
        {submit.isPending ? 'Uploading documents…' : 'Submit for review'}
      </Button>

      <p className="text-xs text-slate-400 text-center">
        Documents are reviewed within 1–2 business days. You will be notified when approved.
      </p>
    </form>
  )
}
