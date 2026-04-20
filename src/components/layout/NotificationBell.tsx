import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NotificationBell() {
  // Phase 14 will wire up Supabase Realtime unread count
  const unreadCount = 0

  return (
    <Button
      variant="ghost"
      size="sm"
      className="relative text-slate-400 hover:text-slate-200 p-2"
      aria-label="Notifications"
    >
      <Bell size={18} />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-teal-500 text-[10px] font-semibold text-white flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Button>
  )
}
