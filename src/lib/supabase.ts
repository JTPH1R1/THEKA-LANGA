import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'
import type { Database } from '@/types/database.types'

export const supabase = createClient<Database>(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: { eventsPerSecond: 10 },
  },
})

// Schema-qualified helpers — use these instead of supabase.from() directly
// Keeps schema names in one place and makes queries self-documenting
export const db = {
  core:     () => supabase.schema('core'),
  kyc:      () => supabase.schema('kyc'),
  sacco:    () => supabase.schema('sacco'),
  finance:  () => supabase.schema('finance'),
  personal: () => supabase.schema('personal'),
  audit:    () => supabase.schema('audit'),
  system:   () => supabase.schema('system'),
} as const

// Schema-qualified RPC caller.
// Neither supabase.rpc(fn, params, { schema }) nor supabase.schema(s).rpc() correctly sets
// Content-Profile in Supabase JS v2 — both send 'public' regardless of the schema argument.
// We bypass the client and use a raw fetch with the correct Content-Profile header.
export async function schemaRpc<T = unknown>(
  schema: keyof typeof db,
  fn: string,
  params: Record<string, unknown> = {},
): Promise<{ data: T; error: { message: string } | null }> {
  const { data: { session } } = await supabase.auth.getSession()

  const headers: Record<string, string> = {
    'Content-Type':  'application/json',
    'apikey':        env.VITE_SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${session?.access_token ?? env.VITE_SUPABASE_ANON_KEY}`,
    'Content-Profile': schema,
    'Accept-Profile':  schema,
  }

  try {
    const res = await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      return {
        data:  null as unknown as T,
        error: { message: body.message ?? body.hint ?? `HTTP ${res.status}` },
      }
    }

    const data = await res.json()
    return { data: data as T, error: null }
  } catch (err) {
    return {
      data:  null as unknown as T,
      error: { message: err instanceof Error ? err.message : 'Network error' },
    }
  }
}
