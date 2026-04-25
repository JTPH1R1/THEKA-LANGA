import { useState, useRef, useEffect } from 'react'
import { Bell, CheckCheck, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useNotifications, useMarkNotificationRead, useMarkAllRead } from '@/hooks/useNotifications'
import { formatDateTime } from '@/lib/formatters'
import type { AppNotification } from '@/types/domain.types'

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'text-rose-600',
  high:   'text-amber-600',
  normal: 'text-slate-700',
  low:    'text-slate-500',
}

export function NotificationBell() {
  const [open, setOpen]   = useState(false)
  const containerRef      = useRef<HTMLDivElement>(null)
  const navigate          = useNavigate()

  const { data: notifications = [], unreadCount } = useNotifications()
  const { mutate: markRead }  = useMarkNotificationRead()
  const { mutate: markAll }   = useMarkAllRead()

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [open])

  function handleItemClick(n: AppNotification) {
    if (!n.read) markRead(n.id)
    if (n.actionUrl) navigate(n.actionUrl)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="relative text-slate-500 hover:text-slate-700 p-2"
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-teal-500 text-[10px] font-semibold text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-semibold text-slate-900">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-xs font-normal text-teal-600">{unreadCount} new</span>
              )}
            </span>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAll()}
                  className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700"
                >
                  <CheckCheck size={12} />
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && (
              <div className="px-4 py-8 text-center text-slate-400 text-sm">
                No notifications
              </div>
            )}
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleItemClick(n)}
                className={[
                  'w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors',
                  !n.read ? 'bg-teal-50/60' : '',
                ].join(' ')}
              >
                <div className="flex items-start gap-2.5">
                  <span className={['mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0', !n.read ? 'bg-teal-500' : 'bg-transparent'].join(' ')} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-medium leading-snug ${PRIORITY_COLORS[n.priority] ?? 'text-slate-700'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-snug">{n.body}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{formatDateTime(n.createdAt)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
