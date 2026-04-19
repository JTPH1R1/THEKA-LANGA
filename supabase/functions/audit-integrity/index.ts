import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Scheduled daily. Checks that audit.events row counts have not decreased.
// Alerts by writing to system.errors if integrity is violated.
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
    // Read stored count from system config
    const { data: config } = await supabase
      .schema('core')
      .from('system_config')
      .select('value')
      .eq('key', 'audit_events_last_count')
      .single()

    const { count: currentCount } = await supabase
      .schema('audit')
      .from('events')
      .select('*', { count: 'exact', head: true })

    const lastCount = config ? Number(config.value) : 0

    if (currentCount !== null && currentCount < lastCount) {
      // Integrity violation — rows were deleted
      await supabase.schema('system').from('errors').insert({
        source: 'edge_function',
        error_code: 'AUDIT_INTEGRITY_VIOLATION',
        message: `audit.events row count decreased from ${lastCount} to ${currentCount}`,
        context: { last_count: lastCount, current_count: currentCount },
      })
    }

    // Update stored count
    await supabase
      .schema('core')
      .from('system_config')
      .upsert({
        key: 'audit_events_last_count',
        value: currentCount ?? 0,
        description: 'Last known row count of audit.events — used for integrity check',
      })

    const duration_ms = Date.now() - started_at.getTime()

    await supabase.schema('system').from('job_log').insert({
      job_name: 'audit-integrity',
      status: 'completed',
      started_at: started_at.toISOString(),
      completed_at: new Date().toISOString(),
      duration_ms,
      metadata: { last_count: lastCount, current_count: currentCount },
    })

    return new Response(JSON.stringify({ ok: true, current_count: currentCount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    await supabase.schema('system').from('job_log').insert({
      job_name: 'audit-integrity',
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
