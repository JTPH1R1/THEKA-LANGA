import { useRef, useState } from 'react'
import { Upload, X, FileCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadFieldProps {
  label: string
  accept?: string
  hint?: string
  required?: boolean
  onChange: (file: File | undefined) => void
  error?: string
}

export function FileUploadField({
  label,
  accept = 'image/jpeg,image/png,image/webp,application/pdf',
  hint,
  required,
  onChange,
  error,
}: FileUploadFieldProps) {
  const [file, setFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? undefined
    setFile(f ?? null)
    onChange(f)
  }

  function handleRemove() {
    setFile(null)
    onChange(undefined)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-1.5">
      <p className="text-sm text-slate-700">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </p>

      {file ? (
        <div className="flex items-center justify-between bg-teal-100/20 border border-teal-200 rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <FileCheck className="text-teal-600 shrink-0" size={16} />
            <span className="text-xs text-teal-700 truncate">{file.name}</span>
            <span className="text-xs text-slate-400 shrink-0">
              ({(file.size / 1024).toFixed(0)} KB)
            </span>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-slate-400 hover:text-red-400 transition-colors ml-2 shrink-0"
            aria-label="Remove file"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            'w-full flex flex-col items-center gap-2 border-2 border-dashed rounded-lg p-4 transition-colors',
            error
              ? 'border-red-300 bg-red-50 hover:border-red-400'
              : 'border-gray-300 bg-gray-100/50 hover:border-teal-600 hover:bg-teal-100/10'
          )}
        >
          <Upload className="text-slate-400" size={20} />
          <span className="text-xs text-slate-400">Click to upload</span>
        </button>
      )}

      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
