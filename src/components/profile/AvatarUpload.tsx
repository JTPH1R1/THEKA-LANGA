import { useRef, useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useUploadAvatar } from '@/hooks/useProfile'

interface AvatarUploadProps {
  currentUrl: string | null
  displayName: string
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')
}

export function AvatarUpload({ currentUrl, displayName }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const upload = useUploadAvatar()

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2 MB')
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPG, PNG, or WebP images are accepted')
      return
    }

    setPreview(URL.createObjectURL(file))

    try {
      await upload.mutateAsync(file)
      toast.success('Photo updated')
    } catch {
      setPreview(null)
      toast.error('Upload failed. Please try again.')
    }
  }

  const displayUrl = preview ?? currentUrl

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group cursor-pointer" onClick={() => inputRef.current?.click()}>
        <Avatar className="h-20 w-20 ring-2 ring-slate-700 ring-offset-2 ring-offset-slate-900">
          <AvatarImage src={displayUrl ?? undefined} alt={displayName} />
          <AvatarFallback className="bg-teal-900 text-teal-300 text-xl font-semibold">
            {getInitials(displayName || 'U')}
          </AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {upload.isPending ? (
            <Loader2 className="text-white animate-spin" size={20} />
          ) : (
            <Camera className="text-white" size={20} />
          )}
        </div>
      </div>
      <p className="text-xs text-slate-500">Click to upload · JPG, PNG, WebP · max 2 MB</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
