import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth.store'

/**
 * Bootstraps the Supabase auth session and subscribes to auth state changes.
 * Must be called once at the app root. Returns the current auth loading state.
 */
export function useSessionInit() {
  const setSession = useAuthStore((s) => s.setSession)

  useEffect(() => {
    // Get the existing session on mount (handles page refresh)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Subscribe to auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [setSession])
}

export function useSession() {
  return useAuthStore((s) => ({
    session: s.session,
    user: s.user,
    isLoading: s.isLoading,
    isAuthenticated: !!s.session,
  }))
}
