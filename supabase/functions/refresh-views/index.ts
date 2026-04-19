import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Scheduled every 15 minutes via Supabase cron or called manually.
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const started_at = new Date()

  try {
    await supabase.rpc('refresh_materialized_views')

    const duration_ms = Date.now() - started_at.getTime()

    await supabase.schema('system').from('job_log').insert({
      job_name: 'refresh-views',
      status: 'completed',
      started_at: started_at.toISOString(),
      completed_at: new Date().toISOString(),
      duration_ms,
    })

    return new Response(JSON.stringify({ ok: true, duration_ms }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    await supabase.schema('system').from('job_log').insert({
      job_name: 'refresh-views',
      status: 'failed',
      started_at: started_at.toISOString(),
      error_message: String(err),
    })

    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
