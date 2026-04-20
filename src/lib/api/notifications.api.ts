import { db } from '@/lib/supabase'
import type { AppNotification } from '@/types/domain.types'

export async function getNotifications(profileId: string): Promise<AppNotification[]> {
  const { data, error } = await db.system()
    .from('notifications')
    .select('*')
    .eq('recipient_id', profileId)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => ({
    id:          r.id,
    recipientId: r.recipient_id,
    groupId:     r.group_id,
    type:        r.type,
    priority:    r.priority as AppNotification['priority'],
    title:       r.title,
    body:        r.body,
    actionUrl:   r.action_url,
    data:        r.data as Record<string, unknown> | null,
    read:        r.read,
    readAt:      r.read_at,
    createdAt:   r.created_at,
  }))
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await db.system()
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function markAllNotificationsRead(): Promise<void> {
  const { error } = await db.system()
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('read', false)
  if (error) throw new Error(error.message)
}
