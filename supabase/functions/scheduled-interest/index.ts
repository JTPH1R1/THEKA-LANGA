import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Scheduled daily. Marks overdue contributions as 'late' and
// marks loans past their default threshold as 'defaulted'.
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const started_at = new Date()
  const today = new Date().toISOString().split('T')[0]
  let records_processed = 0

  try {
    // Mark overdue contributions as 'late' (past grace period handled in app layer)
    const { data: lateContribs, error: lateErr } = await supabase
      .schema('finance')
      .from('contributions')
      .update({ status: 'late' })
      .in('status', ['pending', 'partial'])
      .lt('due_date', today)
      .select('id')

    if (lateErr) throw lateErr
    records_processed += lateContribs?.length ?? 0

    // Mark loans as defaulted if past threshold (simplified — group rules checked in app layer)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400_000).toISOString().split('T')[0]
    const { data: defaultedLoans, error: defaultErr } = await supabase
      .schema('finance')
      .from('loans')
      .update({ status: 'defaulted' })
      .in('status', ['disbursed', 'repaying'])
      .lt('due_date', thirtyDaysAgo)
      .select('id, borrower_id')

    if (defaultErr) throw defaultErr
    records_processed += defaultedLoans?.length ?? 0

    // Trigger credit score update for each defaulted loan
    if (defaultedLoans && defaultedLoans.length > 0) {
      for (const loan of defaultedLoans) {
        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/kyc-score`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            profile_id: loan.borrower_id,
            event_type: 'formal_default',
            reference_id: loan.id,
          }),
        })
      }
    }

    const duration_ms = Date.now() - started_at.getTime()

    await supabase.schema('system').from('job_log').insert({
      job_name: 'scheduled-interest',
      status: 'completed',
      started_at: started_at.toISOString(),
      completed_at: new Date().toISOString(),
      duration_ms,
      records_processed,
    })

    return new Response(JSON.stringify({ ok: true, records_processed, duration_ms }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    await supabase.schema('system').from('job_log').insert({
      job_name: 'scheduled-interest',
      status: 'failed',
      started_at: started_at.toISOString(),
      error_message: String(err),
      records_processed,
    })

    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
