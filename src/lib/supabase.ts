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
// supabase.rpc(fn, params, { schema }) silently ignores the schema option in Supabase JS v2.
// supabase.schema(s).rpc(fn, params) sends the correct Accept-Profile / Content-Profile headers.
export function schemaRpc<T = unknown>(
  schema: keyof typeof db,
  fn: string,
  params: Record<string, unknown> = {},
): Promise<{ data: T; error: { message: string } | null }> {
  return (db[schema]() as unknown as {
    rpc: (fn: string, params: Record<string, unknown>) => Promise<{ data: T; error: { message: string } | null }>
  }).rpc(fn, params)
}
