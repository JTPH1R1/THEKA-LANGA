import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { supabase } from '@/lib/supabase'
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/lib/api/notifications.api'
import { useSession } from '@/hooks/useSession'

export function useNotifications() {
  const { user } = useSession()
  const profileId = user?.id
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: queryKeys.notifications(profileId ?? ''),
    queryFn:  () => getNotifications(profileId!),
    enabled:  !!profileId,
    staleTime: 60_000,
  })

  useEffect(() => {
    if (!profileId) return
    const channel = supabase
      .channel(`notifications:${profileId}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'system',
          table:  'notifications',
          filter: `recipient_id=eq.${profileId}`,
        },
        () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications(profileId) }),
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [profileId, queryClient])

  const unreadCount = (query.data ?? []).filter((n) => !n.read).length

  return { ...query, unreadCount }
}

export function useMarkNotificationRead() {
  const { user } = useSession()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      if (user?.id) queryClient.invalidateQueries({ queryKey: queryKeys.notifications(user.id) })
    },
  })
}

export function useMarkAllRead() {
  const { user } = useSession()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      if (user?.id) queryClient.invalidateQueries({ queryKey: queryKeys.notifications(user.id) })
    },
  })
}
